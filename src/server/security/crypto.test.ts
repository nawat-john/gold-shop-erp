import { describe, expect, it } from "vitest";
import { decryptString, encryptString, hmacHash, safeEqualHex } from "./crypto";

describe("encryptString / decryptString", () => {
  it("round-trip ได้ข้อความเดิม", () => {
    const secret = "JBSWY3DPEHPK3PXP"; // ตัวอย่าง TOTP secret
    expect(decryptString(encryptString(secret))).toBe(secret);
  });

  it("รองรับข้อความภาษาไทย", () => {
    const text = "เลขบัตร 1-2345-67890-12-3";
    expect(decryptString(encryptString(text))).toBe(text);
  });

  it("เข้ารหัสค่าเดิมสองครั้งได้ ciphertext ต่างกัน (IV สุ่ม)", () => {
    expect(encryptString("same")).not.toBe(encryptString("same"));
  });

  it("ciphertext ถูกดัดแปลงต้อง throw (GCM auth)", () => {
    const ct = encryptString("sensitive");
    const [iv, tag, data] = ct.split(".");
    const tampered = Buffer.from(data, "base64");
    tampered[0] ^= 0xff;
    expect(() =>
      decryptString(`${iv}.${tag}.${tampered.toString("base64")}`),
    ).toThrow();
  });

  it("รูปแบบ ciphertext ผิดต้อง throw", () => {
    expect(() => decryptString("not-a-ciphertext")).toThrow();
    expect(() => decryptString("a.b")).toThrow();
  });
});

describe("hmacHash", () => {
  it("deterministic — ค่าเดิมได้ hash เดิม (ใช้ค้นหาได้)", () => {
    expect(hmacHash("1234567890123")).toBe(hmacHash("1234567890123"));
  });

  it("ค่าต่างกันได้ hash ต่างกัน", () => {
    expect(hmacHash("a")).not.toBe(hmacHash("b"));
  });
});

describe("safeEqualHex", () => {
  it("เทียบ hash เท่ากัน/ไม่เท่ากันถูกต้อง", () => {
    const h = hmacHash("x");
    expect(safeEqualHex(h, h)).toBe(true);
    expect(safeEqualHex(h, hmacHash("y"))).toBe(false);
  });

  it("ความยาวไม่เท่ากันคืน false ไม่ throw", () => {
    expect(safeEqualHex("aabb", "aa")).toBe(false);
  });
});
