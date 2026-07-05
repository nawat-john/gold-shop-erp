import { describe, expect, it } from "vitest";
import {
  hashPassword,
  validateApprovalPin,
  validatePasswordPolicy,
  verifyPassword,
} from "./password";

describe("hashPassword / verifyPassword", () => {
  it("hash แล้ว verify รหัสถูกต้องผ่าน", async () => {
    const hash = await hashPassword("correct-horse-battery");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, "correct-horse-battery")).toBe(true);
  });

  it("รหัสผิดไม่ผ่าน", async () => {
    const hash = await hashPassword("correct-horse-battery");
    expect(await verifyPassword(hash, "wrong-password!")).toBe(false);
  });

  it("hash เสียรูปคืน false ไม่ throw", async () => {
    expect(await verifyPassword("garbage", "anything")).toBe(false);
  });
});

describe("validatePasswordPolicy", () => {
  it("รับรหัส ≥ 12 ตัวที่ไม่ใช่รหัสยอดนิยม", () => {
    expect(validatePasswordPolicy("Tong96.5-Yaowarat!").ok).toBe(true);
  });

  it("ปฏิเสธรหัสสั้นกว่า 12 ตัว", () => {
    const r = validatePasswordPolicy("short1234");
    expect(r.ok).toBe(false);
  });

  it("ปฏิเสธรหัสยอดนิยม (case-insensitive)", () => {
    expect(validatePasswordPolicy("Password1234").ok).toBe(false);
    expect(validatePasswordPolicy("qwerty123456").ok).toBe(false);
  });
});

describe("validateApprovalPin", () => {
  it("รับ PIN ตัวเลข 6 หลักปกติ", () => {
    expect(validateApprovalPin("308417").ok).toBe(true);
  });

  it("ปฏิเสธเลขซ้ำล้วนและเลขเรียง", () => {
    expect(validateApprovalPin("111111").ok).toBe(false);
    expect(validateApprovalPin("123456").ok).toBe(false);
    expect(validateApprovalPin("654321").ok).toBe(false);
  });

  it("ปฏิเสธความยาว/รูปแบบผิด", () => {
    expect(validateApprovalPin("12345").ok).toBe(false);
    expect(validateApprovalPin("abc123").ok).toBe(false);
  });
});
