// Argon2id ตาม OWASP: memoryCost 64 MiB, timeCost 3, parallelism 4
// ใช้กับทั้งรหัสผ่าน login และ PIN อนุมัติ (step-up)
import argon2 from "argon2";
import { COMMON_PASSWORDS } from "./common-passwords";

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    // hash เสียรูป/ไม่ใช่ argon2 → ถือว่าไม่ผ่าน ไม่โยน error ให้ caller
    return false;
  }
}

export type PasswordPolicyResult = { ok: true } | { ok: false; reason: string };

/** นโยบายรหัสผ่าน: ≥ 12 ตัวอักษร + ไม่อยู่ใน common-password list */
export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  if (password.length < 12) {
    return { ok: false, reason: "รหัสผ่านต้องยาวอย่างน้อย 12 ตัวอักษร" };
  }
  if (password.length > 128) {
    return { ok: false, reason: "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร" };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return {
      ok: false,
      reason: "รหัสผ่านนี้เป็นรหัสยอดนิยมที่เดาง่าย กรุณาตั้งใหม่",
    };
  }
  return { ok: true };
}

/** PIN อนุมัติ: ตัวเลข 6 หลักขึ้นไป และห้ามเป็นเลขซ้ำ/เลขเรียงล้วน */
export function validateApprovalPin(pin: string): PasswordPolicyResult {
  if (!/^\d{6,12}$/.test(pin)) {
    return { ok: false, reason: "PIN ต้องเป็นตัวเลข 6–12 หลัก" };
  }
  if (/^(\d)\1+$/.test(pin)) {
    return { ok: false, reason: "PIN ห้ามเป็นเลขซ้ำล้วน เช่น 111111" };
  }
  const ascending = "0123456789012345";
  const descending = "9876543210987654";
  if (ascending.includes(pin) || descending.includes(pin)) {
    return { ok: false, reason: "PIN ห้ามเป็นเลขเรียง เช่น 123456" };
  }
  return { ok: true };
}
