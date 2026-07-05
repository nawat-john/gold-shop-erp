// TOTP 2FA (otplib v13) — secret เก็บเข้ารหัส AES-256-GCM เสมอ, recovery codes เก็บเป็น HMAC hash
import { randomBytes } from "node:crypto";
import { generate, generateSecret, generateURI, verify } from "otplib";
import {
  decryptString,
  encryptString,
  hmacHash,
} from "@/server/security/crypto";
import type { Db } from "@/server/db";

const RECOVERY_CODE_COUNT = 10;
/// ยอมรับ code ของช่วงเวลาก่อน/หลัง 1 step (30s) กันนาฬิกาเหลื่อม
const COUNTER_TOLERANCE = 1;
const ISSUER = "Gold Shop ERP";

export interface TotpEnrollment {
  /** เก็บค่านี้ลง user.totpSecretEnc ตอนยืนยันสำเร็จ */
  secretEnc: string;
  /** ใช้สร้าง QR ให้ผู้ใช้สแกน — แสดงครั้งเดียว ห้าม log */
  otpauthUrl: string;
}

export async function generateTotpEnrollment(
  username: string,
): Promise<TotpEnrollment> {
  const secret = await generateSecret();
  return {
    secretEnc: encryptString(secret),
    otpauthUrl: await generateURI({ label: username, issuer: ISSUER, secret }),
  };
}

export async function verifyTotpCode(
  secretEnc: string,
  code: string,
): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const secret = decryptString(secretEnc);
  const result = await verify({
    token: code,
    secret,
    counterTolerance: COUNTER_TOLERANCE,
  });
  return result.valid;
}

/** สร้าง code ปัจจุบันจาก secret — ใช้ใน test/enroll verification เท่านั้น */
export async function generateTotpCode(secretEnc: string): Promise<string> {
  return generate({ secret: decryptString(secretEnc) });
}

/**
 * เปิดใช้ 2FA: ยืนยัน code แรกกับ secret ที่ enroll ไว้ แล้วออก recovery codes
 * คืน plaintext recovery codes — แสดงให้ผู้ใช้ครั้งเดียวเท่านั้น
 */
export async function enableTotp(
  db: Db,
  userId: string,
  secretEnc: string,
  confirmationCode: string,
): Promise<{ ok: false } | { ok: true; recoveryCodes: string[] }> {
  if (!(await verifyTotpCode(secretEnc, confirmationCode))) {
    return { ok: false };
  }

  const recoveryCodes = Array.from({ length: RECOVERY_CODE_COUNT }, () =>
    formatRecoveryCode(randomBytes(5).toString("hex")),
  );

  await db.user.update({
    where: { id: userId },
    data: { totpSecretEnc: secretEnc, totpEnabled: true },
  });
  // ล้างชุดเก่า (กรณี re-enroll) แล้วออกชุดใหม่
  await db.recoveryCode.deleteMany({ where: { userId } });
  await db.recoveryCode.createMany({
    data: recoveryCodes.map((code) => ({
      userId,
      codeHash: hmacHash(normalizeRecoveryCode(code)),
    })),
  });

  return { ok: true, recoveryCodes };
}

/** ใช้ recovery code แทน TOTP — ใช้ได้ครั้งเดียว, mark used ใน transaction เดียวกับ login */
export async function consumeRecoveryCode(
  db: Db,
  userId: string,
  code: string,
): Promise<boolean> {
  const codeHash = hmacHash(normalizeRecoveryCode(code));
  const result = await db.recoveryCode.updateMany({
    where: { userId, codeHash, usedAt: null },
    data: { usedAt: new Date() },
  });
  return result.count === 1;
}

function formatRecoveryCode(hex: string): string {
  return `${hex.slice(0, 5)}-${hex.slice(5)}`.toUpperCase();
}

function normalizeRecoveryCode(code: string): string {
  return code.replace(/-/g, "").toLowerCase().trim();
}
