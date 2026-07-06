// Customer Service — โปรไฟล์ลูกค้า CRM, PDPA consent/masking/anonymize, แต้มสะสม/ระดับ
// กติกา: เลขบัตร ปชช. เข้ารหัส AES-256-GCM + HMAC hash สำหรับค้นหา (กันลงทะเบียนซ้ำ + เทียบ AMLO watchlist)
import type { Db } from "@/server/db";
import { CustomerTier, type Customer } from "@/generated/prisma/client";
import {
  encryptString,
  decryptString,
  hmacHash,
} from "@/server/security/crypto";
import {
  allocateDocumentNumber,
  formatDocumentNumber,
} from "./document-number.service";
import { requireApproval } from "./approval.service";
import { writeAuditLog } from "./audit.service";
import { SETTING_KEYS, getNumberSetting } from "./settings.service";

const CUSTOMER_SEQUENCE_KEY = "CUS";

export interface CreateCustomerParams {
  name: string;
  phone?: string | null;
  citizenId?: string | null;
  address?: string | null;
  note?: string | null;
  actorId: string;
}

/** ลงทะเบียนโปรไฟล์ลูกค้าใหม่ — กันลงทะเบียนซ้ำด้วยเลขบัตร ปชช. (ถ้ามี) */
export async function createCustomer(
  db: Db,
  params: CreateCustomerParams,
): Promise<Customer> {
  const { name, phone, citizenId, address, note, actorId } = params;
  if (!name.trim()) throw new Error("กรุณาระบุชื่อลูกค้า");

  const citizenIdHash = citizenId ? hmacHash(citizenId) : null;
  if (citizenIdHash) {
    const existing = await db.customer.findUnique({ where: { citizenIdHash } });
    if (existing) {
      throw new Error(`ลูกค้ารายนี้มีอยู่แล้วในระบบ (${existing.code})`);
    }
  }

  const nextNum = await allocateDocumentNumber(db, CUSTOMER_SEQUENCE_KEY);
  const code = formatDocumentNumber(CUSTOMER_SEQUENCE_KEY, nextNum);

  const customer = await db.customer.create({
    data: {
      code,
      name: name.trim(),
      phone: phone ?? null,
      address: address ?? null,
      note: note ?? null,
      citizenIdEnc: citizenId ? encryptString(citizenId) : null,
      citizenIdHash,
      createdBy: actorId,
    },
  });

  await writeAuditLog(db, {
    action: "customer.create",
    entityType: "customer",
    entityId: customer.id,
    actorId,
    after: { code, name: customer.name },
  });

  return customer;
}

/**
 * หาโปรไฟล์ลูกค้าจากเลขบัตร ปชช. ถ้ามีอยู่แล้ว มิฉะนั้นลงทะเบียนใหม่จากข้อมูล inline
 * ใช้ตอนธุรกรรม (ขายฝาก/รับซื้อ) ชนเพดาน AMLO แล้วต้องมี KYC แต่ยังไม่เคยลงทะเบียนลูกค้าไว้ล่วงหน้า
 */
export async function findOrCreateCustomerFromInline(
  db: Db,
  params: {
    name: string;
    phone?: string | null;
    citizenId: string;
    actorId: string;
  },
): Promise<Customer> {
  const citizenIdHash = hmacHash(params.citizenId);
  const existing = await db.customer.findUnique({ where: { citizenIdHash } });
  if (existing) return existing;

  return createCustomer(db, {
    name: params.name,
    phone: params.phone,
    citizenId: params.citizenId,
    actorId: params.actorId,
  });
}

export interface UpdateCustomerParams {
  customerId: string;
  name?: string;
  phone?: string | null;
  citizenId?: string | null;
  address?: string | null;
  note?: string | null;
  actorId: string;
}

/** แก้ไขโปรไฟล์ลูกค้า */
export async function updateCustomer(
  db: Db,
  params: UpdateCustomerParams,
): Promise<Customer> {
  const { customerId, name, phone, citizenId, address, note, actorId } = params;
  const customer = await db.customer.findUniqueOrThrow({
    where: { id: customerId },
  });

  let citizenIdEnc = customer.citizenIdEnc;
  let citizenIdHash = customer.citizenIdHash;
  if (citizenId !== undefined) {
    citizenIdHash = citizenId ? hmacHash(citizenId) : null;
    if (citizenIdHash) {
      const dup = await db.customer.findUnique({ where: { citizenIdHash } });
      if (dup && dup.id !== customerId) {
        throw new Error(
          `เลขบัตร ปชช. นี้ถูกใช้กับลูกค้ารายอื่นแล้ว (${dup.code})`,
        );
      }
    }
    citizenIdEnc = citizenId ? encryptString(citizenId) : null;
  }

  const updated = await db.customer.update({
    where: { id: customerId },
    data: {
      name: name?.trim() ?? customer.name,
      phone: phone === undefined ? customer.phone : phone,
      address: address === undefined ? customer.address : address,
      note: note === undefined ? customer.note : note,
      citizenIdEnc,
      citizenIdHash,
    },
  });

  await writeAuditLog(db, {
    action: "customer.update",
    entityType: "customer",
    entityId: customerId,
    actorId,
  });

  return updated;
}

/** บันทึก/ถอนความยินยอม PDPA */
export async function setConsent(
  db: Db,
  params: { customerId: string; given: boolean; actorId: string },
): Promise<Customer> {
  const now = new Date();
  const updated = await db.customer.update({
    where: { id: params.customerId },
    data: params.given
      ? { consentGivenAt: now, consentWithdrawnAt: null }
      : { consentWithdrawnAt: now },
  });

  await writeAuditLog(db, {
    action: params.given
      ? "customer.consent_given"
      : "customer.consent_withdrawn",
    entityType: "customer",
    entityId: params.customerId,
    actorId: params.actorId,
  });

  return updated;
}

export interface AnonymizeCustomerParams {
  customerId: string;
  approverUsername: string;
  pin: string;
  actorId: string;
  requestId?: string | null;
}

/** สิทธิ์ถูกลืม (PDPA) — ล้างข้อมูลส่วนตัว เก็บแถวไว้เพื่อคง FK ประวัติธุรกรรม ต้องมี PIN อนุมัติ */
export async function anonymizeCustomer(
  db: Db,
  {
    customerId,
    approverUsername,
    pin,
    actorId,
    requestId,
  }: AnonymizeCustomerParams,
): Promise<Customer> {
  const approval = await requireApproval(db, {
    approverUsername,
    pin,
    permission: "customer.anonymize",
    actorId,
    action: `customer.anonymize:${customerId}`,
    requireDifferentApprover: true,
    requestId,
  });
  if (!approval.ok) {
    throw new Error(`ล้างข้อมูลลูกค้าด้วย PIN ล้มเหลว: ${approval.reason}`);
  }

  const updated = await db.customer.update({
    where: { id: customerId },
    data: {
      name: "ลูกค้า (ข้อมูลถูกลบตามคำขอ)",
      phone: null,
      address: null,
      note: null,
      citizenIdEnc: null,
      citizenIdHash: null,
      anonymizedAt: new Date(),
    },
  });

  await writeAuditLog(db, {
    action: "customer.anonymize",
    entityType: "customer",
    entityId: customerId,
    actorId,
    requestId,
    after: { approverId: approval.approverId },
  });

  return updated;
}

/** มาสก์เลขบัตร ปชช. ให้เห็นเฉพาะ 4 หลักท้าย — ใช้แสดงผลกับ role ที่ไม่มีสิทธิ์ customer.view_pii */
export function maskCitizenId(plainCitizenId: string): string {
  const last4 = plainCitizenId.slice(-4);
  return `${"x".repeat(Math.max(plainCitizenId.length - 4, 0))}${last4}`;
}

/** ถอดรหัสเลขบัตร ปชช. เพื่อแสดงผล — เรียกเฉพาะเมื่อผู้ใช้มีสิทธิ์ customer.view_pii แล้วเท่านั้น */
export function decryptCitizenId(citizenIdEnc: string): string {
  return decryptString(citizenIdEnc);
}

async function recalculateTier(db: Db, customerId: string): Promise<void> {
  const customer = await db.customer.findUniqueOrThrow({
    where: { id: customerId },
  });
  const silverThreshold = await getNumberSetting(
    db,
    SETTING_KEYS.loyaltyTierSilverPoints,
    1000,
  );
  const goldThreshold = await getNumberSetting(
    db,
    SETTING_KEYS.loyaltyTierGoldPoints,
    5000,
  );

  const tier: CustomerTier =
    customer.loyaltyPoints >= goldThreshold
      ? CustomerTier.GOLD
      : customer.loyaltyPoints >= silverThreshold
        ? CustomerTier.SILVER
        : CustomerTier.BRONZE;

  if (tier !== customer.tier) {
    await db.customer.update({ where: { id: customerId }, data: { tier } });
  }
}

/** ให้แต้มสะสมตามยอดซื้อ (เรียกจากธุรกรรมที่ผูก customerId — ขาย/รับซื้อ/ขายฝาก) */
export async function awardLoyaltyPoints(
  db: Db,
  params: { customerId: string; amountSatang: bigint },
): Promise<void> {
  if (params.amountSatang <= 0n) return;

  const bahtPerPoint = await getNumberSetting(
    db,
    SETTING_KEYS.loyaltyBahtPerPoint,
    1000,
  );
  const bahtSpent = Number(params.amountSatang) / 100;
  const points = Math.floor(bahtSpent / bahtPerPoint);
  if (points <= 0) return;

  await db.customer.update({
    where: { id: params.customerId },
    data: { loyaltyPoints: { increment: points } },
  });

  await recalculateTier(db, params.customerId);
}

export interface CustomerTransactionHistoryRow {
  type: "SALE" | "PURCHASE" | "PAWN" | "SAVINGS" | "WORK_ORDER";
  docNo: string;
  date: Date;
  amountSatang: bigint;
  status: string;
}

/** รวมประวัติธุรกรรมของลูกค้าจากทุกโมดูล เรียงตามวันที่ล่าสุดก่อน */
export async function getCustomerTransactionHistory(
  db: Db,
  customerId: string,
): Promise<CustomerTransactionHistoryRow[]> {
  const [sales, purchases, pawns, savings, workOrders] = await Promise.all([
    db.salesOrder.findMany({ where: { customerId } }),
    db.purchaseOrder.findMany({ where: { customerId } }),
    db.pawnContract.findMany({ where: { customerId } }),
    db.savingsAccount.findMany({ where: { customerId } }),
    db.workOrder.findMany({ where: { customerId } }),
  ]);

  const rows: CustomerTransactionHistoryRow[] = [
    ...sales.map((s) => ({
      type: "SALE" as const,
      docNo: s.docNo,
      date: s.createdAt,
      amountSatang: s.totalAmountSatang,
      status: s.status,
    })),
    ...purchases.map((p) => ({
      type: "PURCHASE" as const,
      docNo: p.docNo,
      date: p.createdAt,
      amountSatang: p.totalAmountSatang,
      status: p.status,
    })),
    ...pawns.map((p) => ({
      type: "PAWN" as const,
      docNo: p.docNo,
      date: p.createdAt,
      amountSatang: p.principalSatang,
      status: p.status,
    })),
    ...savings.map((s) => ({
      type: "SAVINGS" as const,
      docNo: s.docNo,
      date: s.createdAt,
      amountSatang: s.balanceSatang,
      status: s.status,
    })),
    ...workOrders.map((w) => ({
      type: "WORK_ORDER" as const,
      docNo: w.docNo,
      date: w.createdAt,
      amountSatang: w.depositSatang,
      status: w.status,
    })),
  ];

  return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
}
