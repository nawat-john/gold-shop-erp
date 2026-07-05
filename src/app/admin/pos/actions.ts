"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import {
  openShift,
  closeShift,
  reconcileShift,
} from "@/server/services/shift.service";
import {
  createSalesOrder,
  createPurchaseOrder,
  createTradeIn,
  voidOrder,
} from "@/server/services/pos.service";
import { satangFromBahtString } from "@/server/domain/money";
import { PaymentMethod } from "@/generated/prisma/client";

export interface FormState {
  success?: string;
  error?: string;
}

/**
 * Action เปิดกะพนักงานขาย
 */
export async function openShiftAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.count"); // ต้องการสิทธิ์ตรวจ/ดูแลลิ้นชัก

  const drawerId = formData.get("drawerId") as string;
  const startCashBahtStr = formData.get("startCashBahtStr") as string;

  if (!drawerId || !startCashBahtStr) {
    return { error: "กรุณากรอกข้อมูลลิ้นชักและยอดเงินสดเริ่มต้น" };
  }

  try {
    const startCashSatang = satangFromBahtString(startCashBahtStr);
    const activeBranch = await prisma.cashDrawer.findUniqueOrThrow({
      where: { id: drawerId },
      select: { branchId: true },
    });

    await openShift(prisma, {
      branchId: activeBranch.branchId,
      drawerId,
      openedById: session.user.id,
      startCashSatang,
    });

    revalidatePath("/admin/pos/shifts");
    return { success: "เปิดกะการทำงานสำเร็จ" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

/**
 * Action ปิดกะพนักงานขาย
 */
export async function closeShiftAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const shiftId = formData.get("shiftId") as string;
  const endCashBahtStr = formData.get("endCashBahtStr") as string;

  if (!shiftId || !endCashBahtStr) {
    return { error: "กรุณาระบุจำนวนเงินสดปิดกะจริง" };
  }

  try {
    const endCashSatang = satangFromBahtString(endCashBahtStr);
    await closeShift(prisma, {
      shiftId,
      closedById: session.user.id,
      endCashSatang,
    });

    revalidatePath("/admin/pos/shifts");
    return { success: "ปิดกะการทำงานและคำนวณยอดกระทบยอดแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

/**
 * Action อนุมัติกระทบยอดลิ้นชักเงินสด (Reconcile)
 */
export async function reconcileShiftAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.adjust"); // จำกัดสิทธิ์ Manager / Owner เท่านั้น

  const shiftId = formData.get("shiftId") as string;

  if (!shiftId) {
    return { error: "กรุณาระบุรหัสกะการทำงาน" };
  }

  try {
    await reconcileShift(prisma, {
      shiftId,
      reconciledById: session.user.id,
    });

    revalidatePath("/admin/pos/shifts");
    return { success: "อนุมัติการกระทบยอดลิ้นชักเงินสดเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

/**
 * Action ยืนยันการสั่งขายบิล (Sales Order) จากหน้าจอ POS Client
 */
export async function createSalesOrderAction(
  branchId: string,
  shiftId: string,
  items: Array<{
    productId: string;
    itemId?: string | null;
    quantity: number;
    laborChargeSatang: bigint;
  }>,
  payments: Array<{
    paymentMethod: PaymentMethod;
    amountSatang: bigint;
    feeSatang?: bigint;
    referenceNo?: string | null;
    slipPath?: string | null;
  }>,
  idempotencyKey?: string | null,
): Promise<{ success?: string; error?: string; orderId?: string }> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.view");

  try {
    const order = await createSalesOrder(prisma, {
      branchId,
      shiftId,
      items,
      payments,
      idempotencyKey,
      actorId: session.user.id,
    });

    revalidatePath("/admin/pos");
    return { success: "เปิดบิลขายสำเร็จ", orderId: order.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    return { error: message };
  }
}

/**
 * Action ยืนยันการรับซื้อคืนทองเก่า (Purchase Order) จาก POS
 */
export async function createPurchaseOrderAction(
  branchId: string,
  shiftId: string,
  customerName: string | null,
  customerPhone: string | null,
  items: Array<{
    productId?: string | null;
    description: string;
    weightMg: bigint;
    goldPurity: number;
    unitPriceSatang: bigint;
    totalAmountSatang: bigint;
  }>,
  payments: Array<{
    paymentMethod: PaymentMethod;
    amountSatang: bigint;
    referenceNo?: string | null;
    slipPath?: string | null;
  }>,
  idempotencyKey?: string | null,
): Promise<{ success?: string; error?: string; orderId?: string }> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.view");

  try {
    const order = await createPurchaseOrder(prisma, {
      branchId,
      shiftId,
      customerName,
      customerPhone,
      items,
      payments,
      idempotencyKey,
      actorId: session.user.id,
    });

    revalidatePath("/admin/pos");
    return { success: "เปิดบิลรับซื้อทองคำเก่าสำเร็จ", orderId: order.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    return { error: message };
  }
}

/**
 * Action แลกเปลี่ยนเปลี่ยนทองเก่าเป็นทองใหม่ (Trade-in)
 */
export async function createTradeInAction(
  branchId: string,
  shiftId: string,
  customerName: string | null,
  customerPhone: string | null,
  salesItems: Array<{
    productId: string;
    itemId?: string | null;
    quantity: number;
    laborChargeSatang: bigint;
  }>,
  purchaseItems: Array<{
    productId?: string | null;
    description: string;
    weightMg: bigint;
    goldPurity: number;
    unitPriceSatang: bigint;
    totalAmountSatang: bigint;
  }>,
  payments: Array<{
    paymentMethod: PaymentMethod;
    amountSatang: bigint;
    feeSatang?: bigint;
    referenceNo?: string | null;
    slipPath?: string | null;
  }>,
  idempotencyKey?: string | null,
): Promise<{ success?: string; error?: string; tradeInId?: string }> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.view");

  try {
    const tradeIn = await createTradeIn(prisma, {
      branchId,
      shiftId,
      customerName,
      customerPhone,
      salesItems,
      purchaseItems,
      payments,
      idempotencyKey,
      actorId: session.user.id,
    });

    revalidatePath("/admin/pos");
    return { success: "ทำรายการเปลี่ยนทองคำสำเร็จ", tradeInId: tradeIn.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    return { error: message };
  }
}

/**
 * Action อนุมัติและดำเนินการยกเลิกบิลย้อนหลัง (Void)
 */
export async function voidOrderAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const orderType = formData.get("orderType") as
    "SALES" | "PURCHASE" | "TRADE_IN";
  const orderId = formData.get("orderId") as string;
  const voidReason = formData.get("voidReason") as string;
  const approverUsername = formData.get("approverUsername") as string;
  const pin = formData.get("pin") as string;

  if (!orderType || !orderId || !voidReason || !approverUsername || !pin) {
    return { error: "กรุณากรอกข้อมูลขออนุมัติให้ครบถ้วน" };
  }

  try {
    await voidOrder(prisma, {
      orderType,
      orderId,
      voidedById: session.user.id,
      voidReason,
      approverUsername,
      pin,
    });

    revalidatePath("/admin/pos/orders");
    return { success: `ทำการ Void บิลธุรกรรมประเภท ${orderType} สำเร็จแล้ว` };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการยกเลิกบิล";
    return { error: message };
  }
}
