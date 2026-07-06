import { describe, expect, it } from "vitest";
import {
  computeVoidRatePercent,
  isVoidRateAnomalous,
  isStockAdjustCountAnomalous,
  isOffHours,
} from "./fraud-scoring";

describe("computeVoidRatePercent", () => {
  it("คำนวณอัตราปกติ", () => {
    expect(computeVoidRatePercent(5, 20)).toBe(25);
  });

  it("ไม่มีรายการเลย -> 0 (กันหารด้วยศูนย์)", () => {
    expect(computeVoidRatePercent(0, 0)).toBe(0);
  });

  it("void ทั้งหมด -> 100%", () => {
    expect(computeVoidRatePercent(3, 3)).toBe(100);
  });
});

describe("isVoidRateAnomalous", () => {
  it("อัตราสูงแต่ตัวอย่างน้อยกว่าขั้นต่ำ -> ไม่ถือว่าผิดปกติ", () => {
    expect(
      isVoidRateAnomalous({
        voidCount: 1,
        totalCount: 1,
        thresholdPercent: 20,
        minSampleSize: 5,
      }),
    ).toBe(false);
  });

  it("อัตราสูงกว่า threshold และตัวอย่างพอ -> ผิดปกติ", () => {
    expect(
      isVoidRateAnomalous({
        voidCount: 10,
        totalCount: 20,
        thresholdPercent: 20,
        minSampleSize: 5,
      }),
    ).toBe(true);
  });

  it("อัตราเท่ากับ threshold พอดี -> ไม่ถือว่าผิดปกติ (ใช้ strictly greater than)", () => {
    expect(
      isVoidRateAnomalous({
        voidCount: 4,
        totalCount: 20,
        thresholdPercent: 20,
        minSampleSize: 5,
      }),
    ).toBe(false);
  });

  it("ตัวอย่างเท่ากับขั้นต่ำพอดี -> นับรวมด้วย (ใช้ >= ไม่ใช่ >)", () => {
    expect(
      isVoidRateAnomalous({
        voidCount: 3,
        totalCount: 5,
        thresholdPercent: 20,
        minSampleSize: 5,
      }),
    ).toBe(true);
  });
});

describe("isStockAdjustCountAnomalous", () => {
  it("จำนวนต่ำกว่าหรือเท่ากับ threshold -> ไม่ผิดปกติ", () => {
    expect(isStockAdjustCountAnomalous(5, 5)).toBe(false);
  });

  it("จำนวนเกิน threshold -> ผิดปกติ", () => {
    expect(isStockAdjustCountAnomalous(6, 5)).toBe(true);
  });
});

describe("isOffHours", () => {
  it("เวลากลางวันปกติ (14:00) -> ไม่ใช่นอกเวลา", () => {
    expect(isOffHours(new Date(2026, 0, 1, 14, 0))).toBe(false);
  });

  it("ก่อนเปิดร้าน (06:00) -> นอกเวลา", () => {
    expect(isOffHours(new Date(2026, 0, 1, 6, 0))).toBe(true);
  });

  it("หลังปิดร้าน (21:00) -> นอกเวลา", () => {
    expect(isOffHours(new Date(2026, 0, 1, 21, 0))).toBe(true);
  });

  it("ขอบเขตเวลาเปิดร้านพอดี (08:00) -> ไม่ใช่นอกเวลา", () => {
    expect(isOffHours(new Date(2026, 0, 1, 8, 0))).toBe(false);
  });

  it("ขอบเขตเวลาปิดร้านพอดี (20:00) -> ถือว่านอกเวลาแล้ว", () => {
    expect(isOffHours(new Date(2026, 0, 1, 20, 0))).toBe(true);
  });

  it("รองรับ custom business hours", () => {
    expect(isOffHours(new Date(2026, 0, 1, 7, 0), 6, 22)).toBe(false);
  });
});
