"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { satangFromBahtString } from "@/server/domain/money";
import { mgFromGramString } from "@/server/domain/gold";
import {
  createWorkOrder,
  issueGoldToCraftsman,
  startWork,
  completeWorkOrder,
  deliverWorkOrder,
  cancelWorkOrder,
} from "@/server/services/work-order.service";
import {
  postLatestWorkOrderEvent,
  postSafely,
} from "@/server/services/accounting.service";

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

export interface FormState {
  error?: string;
  success?: string;
}

const createSchema = z.object({
  branchId: z.string().uuid("กรุณาเลือกสาขา"),
  type: z.enum(["CUSTOM_ORDER", "REPAIR"]),
  description: z.string().min(1, "กรุณาระบุรายละเอียดงาน"),
  depositBahtStr: z.string().optional().nullable(),
  toleranceGramStr: z.string().optional().nullable(),
  serviceFeeBahtStr: z.string().optional().nullable(),
});

export async function createWorkOrderAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "workorder.manage");

  const parsed = createSchema.safeParse({
    branchId: formData.get("branchId"),
    type: formData.get("type"),
    description: formData.get("description"),
    depositBahtStr: formData.get("depositBahtStr") || null,
    toleranceGramStr: formData.get("toleranceGramStr") || null,
    serviceFeeBahtStr: formData.get("serviceFeeBahtStr") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    const wo = await prisma.$transaction(async (tx) =>
      createWorkOrder(tx, {
        branchId: parsed.data.branchId,
        type: parsed.data.type,
        description: parsed.data.description,
        depositSatang: parsed.data.depositBahtStr
          ? satangFromBahtString(parsed.data.depositBahtStr)
          : 0n,
        toleranceMg: parsed.data.toleranceGramStr
          ? mgFromGramString(parsed.data.toleranceGramStr)
          : 0n,
        serviceFeeSatang: parsed.data.serviceFeeBahtStr
          ? satangFromBahtString(parsed.data.serviceFeeBahtStr)
          : 0n,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    await postSafely(
      () => postLatestWorkOrderEvent(prisma, wo.id, session.user.id),
      { module: "work_order_event", workOrderId: wo.id },
    );

    revalidatePath("/admin/work-orders");
    return { success: `รับงาน ${wo.docNo} เรียบร้อยแล้ว` };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const workOrderIdSchema = z.object({ workOrderId: z.string().uuid() });

export async function startWorkAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "workorder.manage");

  const parsed = workOrderIdSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
  });
  if (!parsed.success) return { error: "ข้อมูลไม่ถูกต้อง" };

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) =>
      startWork(tx, {
        workOrderId: parsed.data.workOrderId,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    revalidatePath(`/admin/work-orders/${parsed.data.workOrderId}`);
    revalidatePath("/admin/work-orders");
    return { success: "เริ่มดำเนินงานแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const issueGoldSchema = z.object({
  workOrderId: z.string().uuid(),
  weightGramStr: z.string().min(1, "กรุณากรอกน้ำหนักทองที่เบิก"),
});

export async function issueGoldAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "workorder.manage");

  const parsed = issueGoldSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
    weightGramStr: formData.get("weightGramStr"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const weightMg = mgFromGramString(parsed.data.weightGramStr);
    const rid = await requestId();
    await prisma.$transaction(async (tx) =>
      issueGoldToCraftsman(tx, {
        workOrderId: parsed.data.workOrderId,
        weightMg,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    revalidatePath(`/admin/work-orders/${parsed.data.workOrderId}`);
    return { success: "บันทึกเบิกทองช่างเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function completeWorkOrderAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "workorder.manage");

  const parsed = workOrderIdSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
  });
  if (!parsed.success) return { error: "ข้อมูลไม่ถูกต้อง" };

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) =>
      completeWorkOrder(tx, {
        workOrderId: parsed.data.workOrderId,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    revalidatePath(`/admin/work-orders/${parsed.data.workOrderId}`);
    revalidatePath("/admin/work-orders");
    return { success: "งานเสร็จสมบูรณ์แล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function deliverWorkOrderAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "workorder.manage");

  const parsed = workOrderIdSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
  });
  if (!parsed.success) return { error: "ข้อมูลไม่ถูกต้อง" };

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) =>
      deliverWorkOrder(tx, {
        workOrderId: parsed.data.workOrderId,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    await postSafely(
      () =>
        postLatestWorkOrderEvent(
          prisma,
          parsed.data.workOrderId,
          session.user.id,
        ),
      { module: "work_order_event", workOrderId: parsed.data.workOrderId },
    );

    revalidatePath(`/admin/work-orders/${parsed.data.workOrderId}`);
    revalidatePath("/admin/work-orders");
    return { success: "ส่งมอบงานให้ลูกค้าเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const cancelSchema = z.object({
  workOrderId: z.string().uuid(),
  reason: z.string().min(1, "กรุณาระบุเหตุผล"),
});

export async function cancelWorkOrderAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "workorder.cancel");

  const parsed = cancelSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) =>
      cancelWorkOrder(tx, {
        workOrderId: parsed.data.workOrderId,
        reason: parsed.data.reason,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    await postSafely(
      () =>
        postLatestWorkOrderEvent(
          prisma,
          parsed.data.workOrderId,
          session.user.id,
        ),
      { module: "work_order_event", workOrderId: parsed.data.workOrderId },
    );

    revalidatePath(`/admin/work-orders/${parsed.data.workOrderId}`);
    revalidatePath("/admin/work-orders");
    return { success: "ยกเลิกใบสั่งงานเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}
