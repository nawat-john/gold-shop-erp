"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { lockPeriod, unlockPeriod } from "@/server/services/accounting.service";
import { backfillJournalEntries } from "@/server/services/accounting-backfill.service";

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

export interface FormState {
  error?: string;
  success?: string;
}

const periodActionSchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, "รูปแบบงวดบัญชีไม่ถูกต้อง"),
  approverUsername: z.string().min(1, "กรุณาระบุ username ผู้อนุมัติ"),
  pin: z.string().min(1, "กรุณากรอกรหัส PIN"),
});

export async function lockPeriodAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "accounting.period_lock");

  const parsed = periodActionSchema.safeParse({
    yearMonth: formData.get("yearMonth"),
    approverUsername: formData.get("approverUsername"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    await lockPeriod(prisma, {
      ...parsed.data,
      actorId: session.user.id,
      requestId: rid,
    });
    revalidatePath("/admin/accounting/periods");
    return { success: `ปิดงวดบัญชี ${parsed.data.yearMonth} เรียบร้อยแล้ว` };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function unlockPeriodAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "accounting.period_unlock");

  const parsed = periodActionSchema.safeParse({
    yearMonth: formData.get("yearMonth"),
    approverUsername: formData.get("approverUsername"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    await unlockPeriod(prisma, {
      ...parsed.data,
      actorId: session.user.id,
      requestId: rid,
    });
    revalidatePath("/admin/accounting/periods");
    return {
      success: `เปิดงวดบัญชี ${parsed.data.yearMonth} กลับมาเรียบร้อยแล้ว`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

// ต้องรับ signature (prevState, formData) ตาม useActionState แม้ไม่ใช้พารามิเตอร์
export async function runBackfillAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: FormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "accounting.post");

  try {
    const result = await backfillJournalEntries(prisma, session.user.id);
    revalidatePath("/admin/accounting");
    revalidatePath("/admin/accounting/reports");
    if (result.failures.length > 0) {
      return {
        error: `โพสต์สำเร็จ ${result.postedCount} รายการ แต่มี ${result.failures.length} รายการล้มเหลว: ${result.failures[0].error}`,
      };
    }
    return {
      success: `โพสต์ธุรกรรมย้อนหลังสำเร็จ ${result.postedCount} รายการ`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}
