import { describe, expect, it } from "vitest";
import {
  formatSatangAsBaht,
  mulDivRoundHalfUp,
  satangFromBahtString,
} from "./money";

describe("satangFromBahtString", () => {
  it("แปลงจำนวนเต็มบาท", () => {
    expect(satangFromBahtString("100")).toBe(10000n);
  });

  it("แปลงทศนิยม 2 ตำแหน่ง", () => {
    expect(satangFromBahtString("1234.50")).toBe(123450n);
  });

  it("แปลงทศนิยม 1 ตำแหน่ง (เติมศูนย์)", () => {
    expect(satangFromBahtString("0.5")).toBe(50n);
  });

  it("รองรับ comma คั่นหลัก", () => {
    expect(satangFromBahtString("1,234,567.89")).toBe(123456789n);
  });

  it("รองรับค่าติดลบ (ใช้กับเอกสารกลับรายการ)", () => {
    expect(satangFromBahtString("-99.99")).toBe(-9999n);
  });

  it("ปฏิเสธทศนิยมเกิน 2 ตำแหน่ง — ไม่ปัดเงียบ", () => {
    expect(() => satangFromBahtString("1.999")).toThrow();
  });

  it("ปฏิเสธ input ที่ไม่ใช่ตัวเลข", () => {
    expect(() => satangFromBahtString("abc")).toThrow();
    expect(() => satangFromBahtString("")).toThrow();
    expect(() => satangFromBahtString("1e5")).toThrow();
  });
});

describe("formatSatangAsBaht", () => {
  it("แสดงผลพร้อม comma และทศนิยม 2 ตำแหน่งเสมอ", () => {
    expect(formatSatangAsBaht(123456789n)).toBe("1,234,567.89");
    expect(formatSatangAsBaht(50n)).toBe("0.50");
    expect(formatSatangAsBaht(0n)).toBe("0.00");
    expect(formatSatangAsBaht(-9999n)).toBe("-99.99");
  });

  it("round-trip กับ satangFromBahtString", () => {
    const cases = ["0.00", "1.00", "999.99", "1,234,567.89"];
    for (const c of cases) {
      expect(formatSatangAsBaht(satangFromBahtString(c))).toBe(c);
    }
  });
});

describe("mulDivRoundHalfUp", () => {
  it("คิด VAT 7% ปัดเศษครึ่งขึ้นที่สตางค์", () => {
    // 100.00 บาท × 7% = 7.00 บาท
    expect(mulDivRoundHalfUp(10000n, 7n, 100n)).toBe(700n);
    // 0.50 บาท × 7% = 0.035 → ปัดเป็น 0.04
    expect(mulDivRoundHalfUp(50n, 7n, 100n)).toBe(4n);
    // 0.07 บาท × 7% = 0.0049 → ปัดเป็น 0.00
    expect(mulDivRoundHalfUp(7n, 7n, 100n)).toBe(0n);
  });

  it("ค่าติดลบปัดแบบสมมาตร (half away from zero)", () => {
    expect(mulDivRoundHalfUp(-50n, 7n, 100n)).toBe(-4n);
  });

  it("ปฏิเสธ denominator ศูนย์หรือติดลบ", () => {
    expect(() => mulDivRoundHalfUp(100n, 1n, 0n)).toThrow();
    expect(() => mulDivRoundHalfUp(100n, 1n, -5n)).toThrow();
  });
});
