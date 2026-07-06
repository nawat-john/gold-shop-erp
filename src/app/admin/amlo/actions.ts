"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import {
  reviewAlert,
  markAlertReported,
  addWatchlistEntry,
} from "@/server/services/amlo.service";

export interface FormState {
  error?: string;
  success?: string;
}

const alertIdSchema = z.object({ alertId: z.string().uuid() });

export async function reviewAlertAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "amlo.manage");

  const parsed = alertIdSchema.safeParse({ alertId: formData.get("alertId") });
  if (!parsed.success) return { error: "ข้อมูลไม่ถูกต้อง" };

  try {
    await reviewAlert(prisma, {
      alertId: parsed.data.alertId,
      actorId: session.user.id,
    });
    revalidatePath("/admin/amlo");
    return { success: "ตรวจทานแจ้งเตือนเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function markAlertReportedAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "amlo.manage");

  const parsed = alertIdSchema.safeParse({ alertId: formData.get("alertId") });
  if (!parsed.success) return { error: "ข้อมูลไม่ถูกต้อง" };

  try {
    await markAlertReported(prisma, {
      alertId: parsed.data.alertId,
      actorId: session.user.id,
    });
    revalidatePath("/admin/amlo");
    return { success: "บันทึกว่าส่งรายงาน AMLO แล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const watchlistSchema = z.object({
  citizenId: z.string().min(1, "กรุณากรอกเลขบัตร ปชช."),
  name: z.string().min(1, "กรุณาระบุชื่อ"),
  reason: z.string().min(1, "กรุณาระบุเหตุผล"),
});

export async function addWatchlistEntryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "amlo.manage");

  const parsed = watchlistSchema.safeParse({
    citizenId: formData.get("citizenId"),
    name: formData.get("name"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    await addWatchlistEntry(prisma, {
      ...parsed.data,
      actorId: session.user.id,
    });
    revalidatePath("/admin/amlo");
    return { success: "เพิ่มรายชื่อเฝ้าระวังเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}
