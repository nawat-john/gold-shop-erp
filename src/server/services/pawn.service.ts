// Pawn Service — สัญญาขายฝากทอง (Phase 5)
// State machine: ACTIVE -> REDEEMED | FORFEITED | CANCELLED (ทุก transition เขียน pawn_events)
// กติกา: เงิน = BIGINT สตางค์, น้ำหนัก = BIGINT มิลลิกรัม, ทองยังเป็นของลูกค้าจนกว่าจะหลุด (FORFEITED)
import type { Db } from "@/server/db";
import {
  PawnContractStatus,
  PawnEventType,
  ItemStatus,
  AcquisitionSource,
  StockMovementType,
  ProductTracking,
  type PawnContract,
} from "@/generated/prisma/client";
import { encryptString, hmacHash } from "@/server/security/crypto";
import {
  allocateDocumentNumber,
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";
import { requireApproval } from "./approval.service";
import { writeAuditLog } from "./audit.service";
import { SETTING_KEYS, getNumberSetting } from "./settings.service";
import {
  addMonths,
  calculateAccruedInterest,
  calculateRedemptionAmount,
  validateInterestRate,
} from "@/server/domain/pawn-interest";

async function getInterestRateCap(db: Db): Promise<number> {
  return getNumberSetting(
    db,
    SETTING_KEYS.pawnInterestRateCapPercentPerYear,
    15,
  );
}

/**
 * ล็อกแถวสัญญาระดับ Postgres (FOR UPDATE) ก่อนอ่าน/แก้ไข — กันสองธุรกรรมชนกัน
 * (เช่น ต่อดอกกับไถ่ถอนพร้อมกัน, อนุมัติทองหลุดซ้ำสองครั้งพร้อมกัน)
 */
async function lockContract(db: Db, contractId: string): Promise<PawnContract> {
  const rows = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM pawn_contracts WHERE id = ${contractId} FOR UPDATE
  `;
  if (rows.length === 0) {
    throw new Error("ไม่พบสัญญาขายฝากที่ระบุ");
  }
  return db.pawnContract.findUniqueOrThrow({ where: { id: contractId } });
}

export interface OpenPawnContractParams {
  branchId: string;
  customerName: string;
  customerPhone?: string | null;
  customerCitizenId?: string | null;
  description: string;
  weightMg: bigint;
  goldPurity: number;
  photoPath?: string | null;
  customerPhotoPath?: string | null;
  locationId?: string | null;
  principalSatang: bigint;
  annualInterestRatePercent: number;
  termMonths: number;
  actorId: string;
  requestId?: string | null;
}

/** เปิดสัญญาขายฝากใหม่ */
export async function openContract(
  db: Db,
  params: OpenPawnContractParams,
): Promise<PawnContract> {
  const {
    branchId,
    customerName,
    customerPhone,
    customerCitizenId,
    description,
    weightMg,
    goldPurity,
    photoPath,
    customerPhotoPath,
    locationId,
    principalSatang,
    annualInterestRatePercent,
    termMonths,
    actorId,
    requestId,
  } = params;

  if (weightMg <= 0n) throw new Error("น้ำหนักทองต้องมากกว่า 0 มิลลิกรัม");
  if (goldPurity <= 0 || goldPurity > 100) {
    throw new Error("ความบริสุทธิ์ทองต้องอยู่ระหว่าง 0 ถึง 100");
  }
  if (principalSatang <= 0n) throw new Error("เงินต้นต้องมากกว่า 0");
  if (!Number.isInteger(termMonths) || termMonths <= 0) {
    throw new Error("ระยะเวลาสัญญาต้องเป็นจำนวนเต็มเดือน มากกว่า 0");
  }
  if (!customerName.trim()) throw new Error("กรุณาระบุชื่อลูกค้า");

  const cap = await getInterestRateCap(db);
  validateInterestRate(annualInterestRatePercent, cap);

  const branch = await db.branch.findUniqueOrThrow({ where: { id: branchId } });
  const yearBE = new Date().getFullYear() + 543;
  const seqKey = buildSequenceKey("PWN", branch.code, yearBE);
  const nextNum = await allocateDocumentNumber(db, seqKey);
  const docNo = formatDocumentNumber(seqKey, nextNum);

  const now = new Date();
  const dueDate = addMonths(now, termMonths);

  const contract = await db.pawnContract.create({
    data: {
      docNo,
      branchId,
      status: PawnContractStatus.ACTIVE,
      customerName: customerName.trim(),
      customerPhone: customerPhone ?? null,
      customerCitizenIdEnc: customerCitizenId
        ? encryptString(customerCitizenId)
        : null,
      customerCitizenIdHash: customerCitizenId
        ? hmacHash(customerCitizenId)
        : null,
      description,
      weightMg,
      goldPurity: goldPurity.toString(),
      photoPath: photoPath ?? null,
      customerPhotoPath: customerPhotoPath ?? null,
      locationId: locationId ?? null,
      principalSatang,
      annualInterestRatePercent: annualInterestRatePercent.toString(),
      termMonths,
      startDate: now,
      dueDate,
      interestPaidThroughDate: now,
      createdBy: actorId,
    },
  });

  await db.pawnEvent.create({
    data: {
      contractId: contract.id,
      eventType: PawnEventType.OPEN,
      principalBeforeSatang: 0n,
      principalAfterSatang: principalSatang,
      actorId,
      requestId,
    },
  });

  await writeAuditLog(db, {
    action: "pawn.open",
    entityType: "pawn_contract",
    entityId: contract.id,
    actorId,
    branchId,
    requestId,
    after: {
      docNo,
      principalSatang: principalSatang.toString(),
      annualInterestRatePercent,
      termMonths,
      dueDate: dueDate.toISOString(),
    },
  });

  return contract;
}

function assertActive(contract: PawnContract): void {
  if (contract.status !== PawnContractStatus.ACTIVE) {
    throw new Error(
      `สัญญานี้ไม่ได้อยู่ในสถานะ ACTIVE (สถานะปัจจุบัน: ${contract.status})`,
    );
  }
}

export interface RenewInterestParams {
  contractId: string;
  actorId: string;
  requestId?: string | null;
  paymentDate?: Date;
}

/** ต่อดอกเบี้ย/รับชำระดอกเบี้ยค้าง — เลื่อน due date ออกไปอีก 1 งวดตามสัญญา */
export async function renewInterest(
  db: Db,
  {
    contractId,
    actorId,
    requestId,
    paymentDate = new Date(),
  }: RenewInterestParams,
) {
  const contract = await lockContract(db, contractId);
  assertActive(contract);

  if (paymentDate.getTime() < contract.interestPaidThroughDate.getTime()) {
    throw new Error("วันที่ชำระดอกเบี้ยต้องไม่ก่อนวันที่ชำระดอกเบี้ยล่าสุด");
  }

  const interestSatang = calculateAccruedInterest({
    principalSatang: contract.principalSatang,
    annualRatePercent: Number(contract.annualInterestRatePercent),
    fromDate: contract.interestPaidThroughDate,
    toDate: paymentDate,
  });

  const newDueDate = addMonths(paymentDate, contract.termMonths);

  await db.pawnInterestPayment.create({
    data: {
      contractId,
      periodFrom: contract.interestPaidThroughDate,
      periodTo: paymentDate,
      interestAmountSatang: interestSatang,
      principalAfterSatang: contract.principalSatang,
      paidAt: paymentDate,
      actorId,
      requestId,
    },
  });

  await db.pawnEvent.create({
    data: {
      contractId,
      eventType: PawnEventType.RENEW_INTEREST,
      principalBeforeSatang: contract.principalSatang,
      principalAfterSatang: contract.principalSatang,
      interestAmountSatang: interestSatang,
      periodFrom: contract.interestPaidThroughDate,
      periodTo: paymentDate,
      actorId,
      requestId,
    },
  });

  const updated = await db.pawnContract.update({
    where: { id: contractId },
    data: {
      interestPaidThroughDate: paymentDate,
      dueDate: newDueDate,
    },
  });

  await writeAuditLog(db, {
    action: "pawn.renew_interest",
    entityType: "pawn_contract",
    entityId: contractId,
    actorId,
    branchId: contract.branchId,
    requestId,
    after: {
      interestSatang: interestSatang.toString(),
      newDueDate: newDueDate.toISOString(),
    },
  });

  return { contract: updated, interestPaidSatang: interestSatang };
}

export interface RedeemContractParams {
  contractId: string;
  actorId: string;
  requestId?: string | null;
  redeemDate?: Date;
}

/** ไถ่ถอนทองคืนลูกค้า — ชำระเงินต้น + ดอกเบี้ยค้างทั้งหมด */
export async function redeemContract(
  db: Db,
  {
    contractId,
    actorId,
    requestId,
    redeemDate = new Date(),
  }: RedeemContractParams,
) {
  const contract = await lockContract(db, contractId);
  assertActive(contract);

  const interestSatang = calculateAccruedInterest({
    principalSatang: contract.principalSatang,
    annualRatePercent: Number(contract.annualInterestRatePercent),
    fromDate: contract.interestPaidThroughDate,
    toDate: redeemDate,
  });
  const totalPayableSatang = calculateRedemptionAmount(
    contract.principalSatang,
    interestSatang,
  );

  if (interestSatang > 0n) {
    await db.pawnInterestPayment.create({
      data: {
        contractId,
        periodFrom: contract.interestPaidThroughDate,
        periodTo: redeemDate,
        interestAmountSatang: interestSatang,
        principalAfterSatang: 0n,
        paidAt: redeemDate,
        actorId,
        requestId,
      },
    });
  }

  await db.pawnEvent.create({
    data: {
      contractId,
      eventType: PawnEventType.REDEEM,
      principalBeforeSatang: contract.principalSatang,
      principalAfterSatang: 0n,
      interestAmountSatang: interestSatang,
      periodFrom: contract.interestPaidThroughDate,
      periodTo: redeemDate,
      actorId,
      requestId,
    },
  });

  const updated = await db.pawnContract.update({
    where: { id: contractId },
    data: {
      status: PawnContractStatus.REDEEMED,
      redeemedAt: redeemDate,
      redeemedById: actorId,
      interestPaidThroughDate: redeemDate,
    },
  });

  await writeAuditLog(db, {
    action: "pawn.redeem",
    entityType: "pawn_contract",
    entityId: contractId,
    actorId,
    branchId: contract.branchId,
    requestId,
    after: {
      interestSatang: interestSatang.toString(),
      totalPayableSatang: totalPayableSatang.toString(),
    },
  });

  return {
    contract: updated,
    interestPaidSatang: interestSatang,
    totalPayableSatang,
  };
}

export interface AdjustPrincipalParams {
  contractId: string;
  /** บวก = เพิ่มเงินต้น (ร้านจ่ายเพิ่ม), ลบ = ลดเงินต้น (ลูกค้าผ่อนคืนบางส่วน) */
  deltaSatang: bigint;
  note?: string | null;
  actorId: string;
  requestId?: string | null;
  adjustmentDate?: Date;
}

/** เพิ่ม/ลดเงินต้นสัญญา — เคลียร์ดอกเบี้ยค้างถึงวันที่ปรับก่อนเสมอ กันดอกเบี้ยตกหล่น */
export async function adjustPrincipal(
  db: Db,
  {
    contractId,
    deltaSatang,
    note,
    actorId,
    requestId,
    adjustmentDate = new Date(),
  }: AdjustPrincipalParams,
) {
  if (deltaSatang === 0n) throw new Error("จำนวนเงินที่ปรับต้องไม่เป็น 0");

  const contract = await lockContract(db, contractId);
  assertActive(contract);

  const newPrincipal = contract.principalSatang + deltaSatang;
  if (newPrincipal <= 0n) {
    throw new Error(
      "เงินต้นหลังปรับต้องมากกว่า 0 — หากต้องการปิดสัญญาให้ใช้การไถ่ถอนแทน",
    );
  }

  const interestSatang = calculateAccruedInterest({
    principalSatang: contract.principalSatang,
    annualRatePercent: Number(contract.annualInterestRatePercent),
    fromDate: contract.interestPaidThroughDate,
    toDate: adjustmentDate,
  });

  if (interestSatang > 0n) {
    await db.pawnInterestPayment.create({
      data: {
        contractId,
        periodFrom: contract.interestPaidThroughDate,
        periodTo: adjustmentDate,
        interestAmountSatang: interestSatang,
        principalAfterSatang: newPrincipal,
        paidAt: adjustmentDate,
        actorId,
        requestId,
      },
    });
  }

  await db.pawnEvent.create({
    data: {
      contractId,
      eventType:
        deltaSatang > 0n
          ? PawnEventType.PRINCIPAL_INCREASE
          : PawnEventType.PRINCIPAL_DECREASE,
      principalBeforeSatang: contract.principalSatang,
      principalAfterSatang: newPrincipal,
      interestAmountSatang: interestSatang > 0n ? interestSatang : null,
      periodFrom: contract.interestPaidThroughDate,
      periodTo: adjustmentDate,
      actorId,
      requestId,
      note: note ?? null,
    },
  });

  const updated = await db.pawnContract.update({
    where: { id: contractId },
    data: {
      principalSatang: newPrincipal,
      interestPaidThroughDate: adjustmentDate,
    },
  });

  await writeAuditLog(db, {
    action: "pawn.adjust_principal",
    entityType: "pawn_contract",
    entityId: contractId,
    actorId,
    branchId: contract.branchId,
    requestId,
    before: { principalSatang: contract.principalSatang.toString() },
    after: { principalSatang: newPrincipal.toString() },
  });

  return { contract: updated, interestSettledSatang: interestSatang };
}

export interface ForfeitContractParams {
  contractId: string;
  approverUsername: string;
  pin: string;
  actorId: string;
  requestId?: string | null;
}

/**
 * อนุมัติทองหลุด — ต้องพ้นระยะผ่อนผันหลังครบกำหนดก่อน และต้องมี PIN ผู้อนุมัติ (Maker-Checker)
 * โอนทรัพย์เข้าสต๊อกจริงเป็นครั้งแรก (source=PAWN_FORFEIT, costSatang=เงินต้นค้าง)
 */
export async function forfeitContract(
  db: Db,
  {
    contractId,
    approverUsername,
    pin,
    actorId,
    requestId,
  }: ForfeitContractParams,
) {
  const contract = await lockContract(db, contractId);
  assertActive(contract);

  const graceDays = await getNumberSetting(
    db,
    SETTING_KEYS.pawnForfeitGraceDays,
    7,
  );
  const forfeitEligibleAt = new Date(
    contract.dueDate.getTime() + graceDays * 86_400_000,
  );
  const now = new Date();
  if (now.getTime() < forfeitEligibleAt.getTime()) {
    throw new Error(
      `ยังไม่พ้นระยะผ่อนผัน ${graceDays} วันหลังครบกำหนด (ครบผ่อนผันวันที่ ${forfeitEligibleAt.toLocaleDateString("th-TH")})`,
    );
  }

  const approval = await requireApproval(db, {
    approverUsername,
    pin,
    permission: "pawn.forfeit",
    branchId: contract.branchId,
    actorId,
    action: `pawn.forfeit:${contractId}`,
    requireDifferentApprover: true,
    requestId,
  });
  if (!approval.ok) {
    throw new Error(`อนุมัติทองหลุดด้วย PIN ล้มเหลว: ${approval.reason}`);
  }

  const outstandingPrincipal = contract.principalSatang;
  const productId = await getOrCreatePawnForfeitProduct(db);

  const invItem = await db.inventoryItem.create({
    data: {
      serialNo: contract.docNo,
      productId,
      branchId: contract.branchId,
      status: ItemStatus.IN_STOCK,
      weightMg: contract.weightMg,
      goldPurity: contract.goldPurity,
      costSatang: outstandingPrincipal,
      source: AcquisitionSource.PAWN_FORFEIT,
      locationId: contract.locationId,
      photoPath: contract.photoPath,
      receivedAt: now,
    },
  });

  await db.stockMovement.create({
    data: {
      movementType: StockMovementType.PAWN_FORFEIT_IN,
      branchId: contract.branchId,
      productId,
      itemId: invItem.id,
      quantity: 1,
      weightMg: contract.weightMg,
      costSatang: outstandingPrincipal,
      refType: "pawn_contract",
      refId: contractId,
      actorId,
      requestId,
    },
  });

  await db.pawnEvent.create({
    data: {
      contractId,
      eventType: PawnEventType.FORFEIT,
      principalBeforeSatang: outstandingPrincipal,
      principalAfterSatang: 0n,
      actorId,
      requestId,
    },
  });

  const updated = await db.pawnContract.update({
    where: { id: contractId },
    data: {
      status: PawnContractStatus.FORFEITED,
      forfeitedAt: now,
      forfeitedById: actorId,
    },
  });

  await writeAuditLog(db, {
    action: "pawn.forfeit",
    entityType: "pawn_contract",
    entityId: contractId,
    actorId,
    branchId: contract.branchId,
    requestId,
    after: {
      outstandingPrincipal: outstandingPrincipal.toString(),
      inventoryItemId: invItem.id,
      approverId: approval.approverId,
    },
  });

  return { contract: updated, inventoryItemId: invItem.id };
}

export interface CancelContractParams {
  contractId: string;
  reason: string;
  approverUsername: string;
  pin: string;
  actorId: string;
  requestId?: string | null;
}

/** ยกเลิกสัญญา (แก้ไขข้อมูลผิดพลาดตั้งแต่เปิดสัญญา) — ต้องยังไม่มีการต่อดอก/ปรับเงินต้นใดๆ */
export async function cancelContract(
  db: Db,
  {
    contractId,
    reason,
    approverUsername,
    pin,
    actorId,
    requestId,
  }: CancelContractParams,
) {
  const contract = await lockContract(db, contractId);
  assertActive(contract);

  if (
    contract.interestPaidThroughDate.getTime() !== contract.startDate.getTime()
  ) {
    throw new Error("ไม่สามารถยกเลิกสัญญาที่มีการต่อดอกหรือปรับเงินต้นไปแล้ว");
  }
  if (!reason.trim()) throw new Error("กรุณาระบุเหตุผลการยกเลิก");

  const approval = await requireApproval(db, {
    approverUsername,
    pin,
    permission: "pawn.cancel",
    branchId: contract.branchId,
    actorId,
    action: `pawn.cancel:${contractId}`,
    requireDifferentApprover: true,
    requestId,
  });
  if (!approval.ok) {
    throw new Error(`ยกเลิกสัญญาด้วย PIN ล้มเหลว: ${approval.reason}`);
  }

  const now = new Date();

  await db.pawnEvent.create({
    data: {
      contractId,
      eventType: PawnEventType.CANCEL,
      principalBeforeSatang: contract.principalSatang,
      principalAfterSatang: contract.principalSatang,
      actorId,
      requestId,
      note: reason,
    },
  });

  const updated = await db.pawnContract.update({
    where: { id: contractId },
    data: {
      status: PawnContractStatus.CANCELLED,
      cancelledAt: now,
      cancelledById: actorId,
      cancelReason: reason,
    },
  });

  await writeAuditLog(db, {
    action: "pawn.cancel",
    entityType: "pawn_contract",
    entityId: contractId,
    actorId,
    branchId: contract.branchId,
    requestId,
    after: { reason, approverId: approval.approverId },
  });

  return updated;
}

/** ทะเบียนคุมทรัพย์ขายฝาก — ใช้แสดงรายการ/ตรวจนับทรัพย์ที่ยังค้ำประกันอยู่ */
export async function getCollateralRegister(
  db: Db,
  params: { branchId?: string } = {},
) {
  return db.pawnContract.findMany({
    where: {
      status: PawnContractStatus.ACTIVE,
      ...(params.branchId ? { branchId: params.branchId } : {}),
    },
    include: { location: true },
    orderBy: { dueDate: "asc" },
  });
}

/** รายการสัญญาใกล้/เกินกำหนด — ใช้ทำ call list แจ้งเตือนลูกค้า */
export async function listDueContracts(
  db: Db,
  params: { branchId?: string; withinDays: number },
) {
  const cutoff = new Date(Date.now() + params.withinDays * 86_400_000);
  return db.pawnContract.findMany({
    where: {
      status: PawnContractStatus.ACTIVE,
      dueDate: { lte: cutoff },
      ...(params.branchId ? { branchId: params.branchId } : {}),
    },
    orderBy: { dueDate: "asc" },
  });
}

/** สินค้าตัวแทน "ทองหลุดขายฝาก" สำหรับกรณีไม่มี SKU ตรงกับทรัพย์ของลูกค้า */
async function getOrCreatePawnForfeitProduct(db: Db): Promise<string> {
  const code = "PAWN_FORFEIT_GOLD";
  let prod = await db.product.findUnique({ where: { sku: code } });
  if (!prod) {
    let cat = await db.productCategory.findFirst();
    if (!cat) {
      cat = await db.productCategory.create({
        data: { code: "OTHER", name: "อื่นๆ", defaultLaborCharge: 0n },
      });
    }
    prod = await db.product.create({
      data: {
        sku: code,
        name: "ทองหลุดขายฝาก",
        categoryId: cat.id,
        tracking: ProductTracking.SERIALIZED,
        goldPurity: 96.5,
      },
    });
  }
  return prod.id;
}
