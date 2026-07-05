// เข้ารหัส field อ่อนไหว (TOTP secret, เลขบัตร ปชช., เลขบัญชี) — AES-256-GCM
// รูปแบบ ciphertext: base64(iv).base64(authTag).base64(encrypted)
// HMAC ใช้สร้าง hash สำหรับ "ค้นหา" ข้อมูลที่เข้ารหัส (เทียบเท่ากันได้ แต่ย้อนกลับไม่ได้)
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/config/env";

const KEY = Buffer.from(env.ENCRYPTION_KEY, "hex");
const IV_LENGTH = 12; // แนะนำสำหรับ GCM
const AUTH_TAG_LENGTH = 16;

export function encryptString(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptString(ciphertext: string): string {
  const parts = ciphertext.split(".");
  if (parts.length !== 3) {
    throw new Error("รูปแบบ ciphertext ไม่ถูกต้อง");
  }
  const [iv, authTag, encrypted] = parts.map((p) => Buffer.from(p, "base64"));
  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("รูปแบบ ciphertext ไม่ถูกต้อง");
  }
  const decipher = createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(authTag);
  // ถ้าข้อมูลถูกแก้ไข decipher.final() จะ throw (GCM authentication ล้มเหลว)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}

/** hash แบบ deterministic สำหรับค้นหา field ที่เข้ารหัส (เช่น เลขบัตร ปชช.) */
export function hmacHash(value: string): string {
  return createHmac("sha256", KEY).update(value, "utf8").digest("hex");
}

/** เปรียบเทียบ hash แบบ constant-time กัน timing attack */
export function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
