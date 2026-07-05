"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { writeAuditLog } from "@/server/services/audit.service";
import {
  hashPassword,
  validatePasswordPolicy,
  verifyPassword,
} from "@/server/security/password";
import {
  enableTotp,
  generateTotpEnrollment,
} from "@/server/services/totp.service";

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

// ── เปลี่ยนรหัสผ่าน ──────────────────────────────────────────────

export interface ChangePasswordState {
  error?: string;
  success?: string;
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน").max(200),
  newPassword: z.string().max(200),
});

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await requireSession();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const policy = validatePasswordPolicy(parsed.data.newPassword);
  if (!policy.ok) return { error: policy.reason };

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  if (!(await verifyPassword(user.passwordHash, parsed.data.currentPassword))) {
    return { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { error: "รหัสผ่านใหม่ต้องต่างจากรหัสเดิม" };
  }

  const rid = await requestId();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(parsed.data.newPassword),
        mustChangePassword: false,
      },
    });
    // ตัด session อื่นทั้งหมด — เหลือเฉพาะเครื่องที่กำลังเปลี่ยนรหัส
    await tx.session.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
        id: { not: session.sessionId },
      },
      data: { revokedAt: new Date() },
    });
    await writeAuditLog(tx, {
      action: "auth.password_changed",
      entityType: "user",
      entityId: user.id,
      actorId: user.id,
      requestId: rid,
    });
  });

  revalidatePath("/admin/profile");
  return { success: "เปลี่ยนรหัสผ่านแล้ว — อุปกรณ์อื่นถูกบังคับออกจากระบบ" };
}

// ── TOTP 2FA ─────────────────────────────────────────────────────

export interface TotpEnrollState {
  error?: string;
  /** ขั้นตอนสแกน QR */
  enrollment?: { secretEnc: string; otpauthUrl: string; qrDataUrl: string };
  /** สำเร็จ — แสดง recovery codes ครั้งเดียว */
  recoveryCodes?: string[];
}

export async function startTotpEnrollAction(): Promise<TotpEnrollState> {
  const session = await requireSession();
  const enrollment = await generateTotpEnrollment(session.user.username);
  const qrDataUrl = await QRCode.toDataURL(enrollment.otpauthUrl, {
    width: 220,
  });
  return { enrollment: { ...enrollment, qrDataUrl } };
}

const confirmTotpSchema = z.object({
  secretEnc: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "รหัสยืนยันต้องเป็นตัวเลข 6 หลัก"),
});

export async function confirmTotpEnrollAction(
  prev: TotpEnrollState,
  formData: FormData,
): Promise<TotpEnrollState> {
  const session = await requireSession();

  const parsed = confirmTotpSchema.safeParse({
    secretEnc: formData.get("secretEnc"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return {
      ...prev,
      error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
    };
  }

  const result = await enableTotp(
    prisma,
    session.user.id,
    parsed.data.secretEnc,
    parsed.data.code,
  );
  if (!result.ok) {
    return { ...prev, error: "รหัสยืนยันไม่ถูกต้อง ลองใหม่อีกครั้ง" };
  }

  await writeAuditLog(prisma, {
    action: "auth.totp_enabled",
    entityType: "user",
    entityId: session.user.id,
    actorId: session.user.id,
    requestId: await requestId(),
  });

  // ห้าม revalidatePath ที่นี่ — จะทำให้ component สลับไปสถานะ "เปิดแล้ว"
  // ก่อนผู้ใช้เห็น recovery codes (แสดงได้ครั้งเดียว)
  return { recoveryCodes: result.recoveryCodes };
}

const disableTotpSchema = z.object({
  password: z.string().min(1, "กรุณายืนยันรหัสผ่าน").max(200),
});

export interface TotpDisableState {
  error?: string;
  success?: string;
}

export async function disableTotpAction(
  _prev: TotpDisableState,
  formData: FormData,
): Promise<TotpDisableState> {
  const session = await requireSession();

  const parsed = disableTotpSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  if (!(await verifyPassword(user.passwordHash, parsed.data.password))) {
    return { error: "รหัสผ่านไม่ถูกต้อง" };
  }

  const rid = await requestId();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { totpEnabled: false, totpSecretEnc: null },
    });
    await tx.recoveryCode.deleteMany({ where: { userId: user.id } });
    await writeAuditLog(tx, {
      action: "auth.totp_disabled",
      entityType: "user",
      entityId: user.id,
      actorId: user.id,
      requestId: rid,
    });
  });

  revalidatePath("/admin/profile");
  return { success: "ปิดใช้งาน 2FA แล้ว" };
}
