import { describe, expect, it } from "vitest";
import {
  addMonths,
  calculateAccruedInterest,
  calculateRedemptionAmount,
  daysBetween,
  validateInterestRate,
} from "./pawn-interest";

describe("Pawn Interest Engine — golden test cases", () => {
  it("1. ดอกเบี้ยเต็มงวด 30 วัน เงินต้น 100,000 บาท อัตรา 15%/ปี", () => {
    const interest = calculateAccruedInterest({
      principalSatang: 10_000_000n, // 100,000 บาท
      annualRatePercent: 15,
      fromDate: new Date("2026-01-01T00:00:00.000Z"),
      toDate: new Date("2026-01-31T00:00:00.000Z"), // 30 วัน
    });
    // 10,000,000 * 15% * 30/365 = 123,287.67... ปัดขึ้นเป็น 123,288 สตางค์ (1,232.88 บาท)
    expect(interest).toBe(123_288n);
  });

  it("2. ต่อดอกกลางงวด (mid-period renewal) 15 วัน เงินต้น 50,000 บาท อัตรา 12%/ปี", () => {
    const interest = calculateAccruedInterest({
      principalSatang: 5_000_000n, // 50,000 บาท
      annualRatePercent: 12,
      fromDate: new Date("2026-03-01T00:00:00.000Z"),
      toDate: new Date("2026-03-16T00:00:00.000Z"), // 15 วัน
    });
    expect(interest).toBe(24_658n);
  });

  it("3. ไถ่ถอนก่อนกำหนด (early redemption) 5 วัน เงินต้น 200,000 บาท อัตรา 15%/ปี", () => {
    const interest = calculateAccruedInterest({
      principalSatang: 20_000_000n, // 200,000 บาท
      annualRatePercent: 15,
      fromDate: new Date("2026-05-01T00:00:00.000Z"),
      toDate: new Date("2026-05-06T00:00:00.000Z"), // 5 วัน
    });
    expect(interest).toBe(41_096n);
  });

  it("4. คำนวณข้ามปี (year boundary) 20 ธ.ค. -> 20 ม.ค. (31 วัน) เงินต้น 10,000 บาท อัตรา 15%/ปี", () => {
    const from = new Date(Date.UTC(2026, 11, 20)); // 2026-12-20
    const to = new Date(Date.UTC(2027, 0, 20)); // 2027-01-20
    expect(daysBetween(from, to)).toBe(31);

    const interest = calculateAccruedInterest({
      principalSatang: 1_000_000n, // 10,000 บาท
      annualRatePercent: 15,
      fromDate: from,
      toDate: to,
    });
    expect(interest).toBe(12_740n);
  });

  it("5. จำนวนวัน <= 0 ต้องไม่มีดอกเบี้ยเกิดขึ้น (กันเรียกซ้ำ/วันที่ผิดพลาด)", () => {
    const sameDay = new Date("2026-06-01T00:00:00.000Z");
    expect(
      calculateAccruedInterest({
        principalSatang: 10_000_000n,
        annualRatePercent: 15,
        fromDate: sameDay,
        toDate: sameDay,
      }),
    ).toBe(0n);

    expect(
      calculateAccruedInterest({
        principalSatang: 10_000_000n,
        annualRatePercent: 15,
        fromDate: new Date("2026-06-10T00:00:00.000Z"),
        toDate: new Date("2026-06-01T00:00:00.000Z"), // ย้อนหลัง
      }),
    ).toBe(0n);
  });

  it("6. อัตราดอกเบี้ยเกินเพดานตามกฎหมายต้องถูกปฏิเสธ ไม่ปัดลดให้เงียบๆ", () => {
    expect(() => validateInterestRate(16, 15)).toThrow();
    expect(() => validateInterestRate(-1, 15)).toThrow();
    expect(() => validateInterestRate(15, 15)).not.toThrow(); // เท่าเพดานพอดี ผ่านได้
    expect(() => validateInterestRate(0, 15)).not.toThrow();
  });

  it("7. ยอดสินไถ่รวม = เงินต้น + ดอกเบี้ยค้าง", () => {
    expect(calculateRedemptionAmount(10_000_000n, 123_288n)).toBe(10_123_288n);
  });

  it("8. เพิ่มเดือนแบบ clamp วันสุดท้ายของเดือน (31 ม.ค. + 1 เดือน -> 28 ก.พ. ปีไม่อธิกสุรทิน)", () => {
    const result = addMonths(new Date(2026, 0, 31), 1);
    expect(result.getMonth()).toBe(1); // กุมภาพันธ์
    expect(result.getDate()).toBe(28);
  });

  it("9. เพิ่มเดือนปกติไม่ชนปลายเดือนต้องตรงวันเดิม", () => {
    const result = addMonths(new Date(2026, 0, 15), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(15);
  });
});
