import { describe, expect, it } from "vitest";
import { convertCashToWeightMg, convertWeightToCashSatang } from "./savings";

describe("Gold Savings conversion formulas — golden test cases", () => {
  it("1. ฝากเงินพอดี 1 บาททอง ที่ราคาขายออก 40,600 บาท -> ได้น้ำหนัก 15.160 กรัมพอดี", () => {
    const weightMg = convertCashToWeightMg(4_060_000n, 4_060_000n);
    expect(weightMg).toBe(15_160n);
  });

  it("2. ฝากเงินครึ่งหนึ่งของราคา 1 บาททอง -> ได้น้ำหนักครึ่งหนึ่ง", () => {
    const weightMg = convertCashToWeightMg(2_030_000n, 4_060_000n);
    expect(weightMg).toBe(7_580n);
  });

  it("3. ปิดบัญชีรับเงินคืน 1 บาททองพอดี ที่ราคารับซื้อ 39,200 บาท -> ได้เงินคืนพอดี", () => {
    const cashSatang = convertWeightToCashSatang(15_160n, 3_920_000n);
    expect(cashSatang).toBe(3_920_000n);
  });

  it("4. ปิดบัญชีรับเงินคืนน้ำหนักครึ่งหนึ่ง -> ได้เงินคืนครึ่งหนึ่ง", () => {
    const cashSatang = convertWeightToCashSatang(7_580n, 3_920_000n);
    expect(cashSatang).toBe(1_960_000n);
  });

  it("5. ราคาทองเป็น 0 หรือติดลบต้องถูกปฏิเสธ ไม่คำนวณเงียบๆ", () => {
    expect(() => convertCashToWeightMg(1_000_000n, 0n)).toThrow();
    expect(() => convertCashToWeightMg(1_000_000n, -1n)).toThrow();
    expect(() => convertWeightToCashSatang(15_160n, 0n)).toThrow();
  });
});
