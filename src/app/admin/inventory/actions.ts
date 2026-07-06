"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { satangFromBahtString } from "@/server/domain/money";
import { mgFromGramString } from "@/server/domain/gold";
import { receiveFromSupplier } from "@/server/services/inventory.service";
import {
  createTransfer,
  sendTransfer,
  receiveTransfer,
  cancelTransfer,
} from "@/server/services/transfer.service";
import {
  startStockCount,
  scanCountItem,
  submitForReview,
  approveStockCount,
} from "@/server/services/stock-count.service";
import {
  createMeltLot,
  sendToMelt,
  closeMeltLot,
  cancelMeltLot,
} from "@/server/services/melt.service";

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

export interface FormState {
  error?: string;
  success?: string;
}

// Zod schema สำหรับการรับสินค้า
const receiveItemSchema = z.object({
  productId: z.string().uuid("กรุณาเลือกแบบสินค้า"),
  branchId: z.string().uuid("กรุณาเลือกสาขาที่รับเข้า"),
  supplierId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  weightGramStr: z.string().min(1, "กรุณากรอกน้ำหนักกรัม"),
  goldPurity: z.coerce
    .number()
    .min(0.01)
    .max(100, "ความบริสุทธิ์ต้องไม่เกิน 100%"),
  costBahtStr: z.string().min(1, "กรุณากรอกต้นทุน (บาท)"),
  laborChargeBahtStr: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "จำนวนต้องมากกว่า 0"),
  serialNo: z.string().optional().nullable(),
});

export async function receiveItemAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.receive");

  const parsed = receiveItemSchema.safeParse({
    productId: formData.get("productId"),
    branchId: formData.get("branchId"),
    supplierId: formData.get("supplierId") || null,
    locationId: formData.get("locationId") || null,
    weightGramStr: formData.get("weightGramStr"),
    goldPurity: formData.get("goldPurity"),
    costBahtStr: formData.get("costBahtStr"),
    laborChargeBahtStr: formData.get("laborChargeBahtStr") || undefined,
    quantity: formData.get("quantity"),
    serialNo: formData.get("serialNo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const weightMg = mgFromGramString(parsed.data.weightGramStr);
    const costSatang = satangFromBahtString(parsed.data.costBahtStr);
    const laborCharge = parsed.data.laborChargeBahtStr
      ? satangFromBahtString(parsed.data.laborChargeBahtStr)
      : null;

    const rid = await requestId();

    await prisma.$transaction(async (tx) => {
      await receiveFromSupplier(tx, {
        productId: parsed.data.productId,
        branchId: parsed.data.branchId,
        supplierId: parsed.data.supplierId,
        locationId: parsed.data.locationId,
        weightMg,
        goldPurity: parsed.data.goldPurity,
        costSatang,
        laborCharge,
        quantity: parsed.data.quantity,
        serialNo: parsed.data.serialNo,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/inventory");
    return { success: "บันทึกการรับเข้าสินค้าเสร็จสิ้น" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

// Zod schema สำหรับการสร้างใบโอนย้าย
const createTransferSchema = z.object({
  fromBranchId: z.string().uuid("กรุณาเลือกสาขาต้นทาง"),
  toBranchId: z.string().uuid("กรุณาเลือกสาขาปลายทาง"),
  itemIdsStr: z.string().min(1, "กรุณาเลือกสินค้าอย่างน้อย 1 ชิ้น"),
  note: z.string().optional().nullable(),
});

export async function createTransferAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const parsed = createTransferSchema.safeParse({
    fromBranchId: formData.get("fromBranchId"),
    toBranchId: formData.get("toBranchId"),
    itemIdsStr: formData.get("itemIdsStr"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  await requirePermission(
    prisma,
    session.user.id,
    "stock.transfer",
    parsed.data.fromBranchId,
  );

  const itemIds = parsed.data.itemIdsStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    await prisma.$transaction(async (tx) => {
      await createTransfer(tx, {
        fromBranchId: parsed.data.fromBranchId,
        toBranchId: parsed.data.toBranchId,
        itemIds,
        note: parsed.data.note,
        actorId: session.user.id,
      });
    });

    revalidatePath("/admin/inventory/transfers");
    return { success: "สร้างใบโอนย้ายสินค้าเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function sendTransferAction(transferId: string): Promise<void> {
  const session = await requireSession();
  const transfer = await prisma.branchTransfer.findUniqueOrThrow({
    where: { id: transferId },
  });
  await requirePermission(
    prisma,
    session.user.id,
    "stock.transfer",
    transfer.fromBranchId,
  );

  const rid = await requestId();
  await prisma.$transaction(async (tx) => {
    await sendTransfer(tx, {
      transferId,
      actorId: session.user.id,
      requestId: rid,
    });
  });

  revalidatePath("/admin/inventory/transfers");
}

export async function receiveTransferAction(transferId: string): Promise<void> {
  const session = await requireSession();
  const transfer = await prisma.branchTransfer.findUniqueOrThrow({
    where: { id: transferId },
  });
  await requirePermission(
    prisma,
    session.user.id,
    "stock.transfer",
    transfer.toBranchId,
  );

  const rid = await requestId();
  await prisma.$transaction(async (tx) => {
    await receiveTransfer(tx, {
      transferId,
      actorId: session.user.id,
      requestId: rid,
    });
  });

  revalidatePath("/admin/inventory/transfers");
}

export async function cancelTransferAction(transferId: string): Promise<void> {
  const session = await requireSession();
  const transfer = await prisma.branchTransfer.findUniqueOrThrow({
    where: { id: transferId },
  });
  await requirePermission(
    prisma,
    session.user.id,
    "stock.transfer",
    transfer.fromBranchId,
  );

  const rid = await requestId();
  await prisma.$transaction(async (tx) => {
    await cancelTransfer(tx, {
      transferId,
      actorId: session.user.id,
      requestId: rid,
    });
  });

  revalidatePath("/admin/inventory/transfers");
}

// ตรวจนับสต๊อก
export async function startStockCountAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.count");

  const branchId = formData.get("branchId") as string;
  const note = formData.get("note") as string;

  if (!branchId) return { error: "กรุณาเลือกสาขา" };

  try {
    await prisma.$transaction(async (tx) => {
      await startStockCount(tx, {
        branchId,
        note,
        actorId: session.user.id,
      });
    });

    revalidatePath("/admin/inventory/stock-counts");
    return { success: "เปิดรอบตรวจนับสต๊อกสินค้าแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function scanCountItemAction(
  countId: string,
  serialNo: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.count");

  try {
    await prisma.$transaction(async (tx) => {
      await scanCountItem(tx, {
        countId,
        serialNo,
        actorId: session.user.id,
      });
    });

    revalidatePath(`/admin/inventory/stock-counts/${countId}`);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    return { success: false, error: msg };
  }
}

export async function submitReviewAction(countId: string): Promise<void> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.count");

  await prisma.$transaction(async (tx) => {
    await submitForReview(tx, {
      countId,
      actorId: session.user.id,
    });
  });

  revalidatePath("/admin/inventory/stock-counts");
}

export async function approveStockCountAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.adjust");

  const countId = formData.get("countId") as string;
  const approverUsername = formData.get("approverUsername") as string;
  const pin = formData.get("pin") as string;

  if (!countId || !approverUsername || !pin) {
    return { error: "ข้อมูลไม่ครบถ้วนสำหรับการอนุมัติ" };
  }

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) => {
      await approveStockCount(tx, {
        countId,
        approverUsername,
        pin,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/inventory/stock-counts");
    return { success: "อนุมัติการปรับยอดตรวจนับสต๊อกสินค้าแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอนุมัติ";
    return { error: message };
  }
}

// โรงหลอม
export async function createMeltLotAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.melt");

  const branchId = formData.get("branchId") as string;
  const itemIdsStr = formData.get("itemIdsStr") as string;
  const note = formData.get("note") as string;

  if (!branchId || !itemIdsStr) {
    return { error: "ข้อมูลไม่ครบถ้วนในการสร้างรอบหลอม" };
  }

  const itemIds = itemIdsStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    await prisma.$transaction(async (tx) => {
      await createMeltLot(tx, {
        branchId,
        itemIds,
        note,
        actorId: session.user.id,
      });
    });

    revalidatePath("/admin/inventory/melt-lots");
    return { success: "สร้างรอบส่งทองเก่าหลอมสำเร็จ" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function sendToMeltAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.melt");

  const lotId = formData.get("lotId") as string;
  const sentWeightGramStr = formData.get("sentWeightGramStr") as string;

  if (!lotId || !sentWeightGramStr) {
    return { error: "กรุณาระบุน้ำหนักที่ส่งหลอม" };
  }

  try {
    const sentWeightMg = mgFromGramString(sentWeightGramStr);
    const rid = await requestId();

    await prisma.$transaction(async (tx) => {
      await sendToMelt(tx, {
        lotId,
        sentWeightMg,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/inventory/melt-lots");
    return { success: "ส่งสินค้าออกจากร้านเพื่อทำการหลอมแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function closeMeltLotAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.melt");

  const lotId = formData.get("lotId") as string;
  const returnedWeightGramStr = formData.get("returnedWeightGramStr") as string;
  const returnedBahtStr = formData.get("returnedBahtStr") as string;

  if (!lotId || !returnedWeightGramStr || !returnedBahtStr) {
    return { error: "กรุณากรอกข้อมูลน้ำหนักและมูลค่าที่ได้รับคืน" };
  }

  try {
    const returnedWeightMg = mgFromGramString(returnedWeightGramStr);
    const returnedSatang = satangFromBahtString(returnedBahtStr);
    const rid = await requestId();

    await prisma.$transaction(async (tx) => {
      await closeMeltLot(tx, {
        lotId,
        returnedWeightMg,
        returnedSatang,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/inventory/melt-lots");
    return { success: "ปิดรอบการหลอมและกระทบยอดสำเร็จ" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function cancelMeltLotAction(lotId: string): Promise<void> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.melt");

  const rid = await requestId();
  await prisma.$transaction(async (tx) => {
    await cancelMeltLot(tx, {
      lotId,
      actorId: session.user.id,
      requestId: rid,
    });
  });

  revalidatePath("/admin/inventory/melt-lots");
}
