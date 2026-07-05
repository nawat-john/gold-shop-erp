import { describe, expect, it } from "vitest";
import {
  MG_PER_BAHT_BAR,
  MG_PER_BAHT_ORNAMENT,
  MG_PER_SALUNG_ORNAMENT,
  formatMgAsGrams,
  mgFromBahtGold,
  mgFromGramString,
} from "./gold";

describe("ค่าคงที่น้ำหนักทองไทย", () => {
  it("1 บาททองรูปพรรณ = 15.16 กรัม", () => {
    expect(MG_PER_BAHT_ORNAMENT).toBe(15160n);
  });

  it("1 บาททองแท่ง = 15.244 กรัม", () => {
    expect(MG_PER_BAHT_BAR).toBe(15244n);
  });

  it("1 สลึงรูปพรรณ = 3.79 กรัม (หนึ่งในสี่ของบาทพอดี)", () => {
    expect(MG_PER_SALUNG_ORNAMENT).toBe(3790n);
    expect(MG_PER_SALUNG_ORNAMENT * 4n).toBe(MG_PER_BAHT_ORNAMENT);
  });
});

describe("mgFromGramString", () => {
  it("แปลงกรัมทศนิยม 3 ตำแหน่ง", () => {
    expect(mgFromGramString("15.16")).toBe(15160n);
    expect(mgFromGramString("15.244")).toBe(15244n);
    expect(mgFromGramString("0.001")).toBe(1n);
  });

  it("ปฏิเสธทศนิยมเกิน 3 ตำแหน่ง", () => {
    expect(() => mgFromGramString("1.0001")).toThrow();
  });

  it("ปฏิเสธค่าติดลบและ input ผิดรูปแบบ", () => {
    expect(() => mgFromGramString("-1")).toThrow();
    expect(() => mgFromGramString("abc")).toThrow();
  });
});

describe("mgFromBahtGold", () => {
  it("ทองรูปพรรณ 2 บาท = 30.32 กรัม", () => {
    expect(mgFromBahtGold(2n, "ornament")).toBe(30320n);
  });

  it("ทองแท่ง 5 บาท = 76.22 กรัม", () => {
    expect(mgFromBahtGold(5n, "bar")).toBe(76220n);
  });
});

describe("formatMgAsGrams", () => {
  it("แสดงทศนิยม 3 ตำแหน่งเสมอ (ตรงกับ NUMERIC(10,3))", () => {
    expect(formatMgAsGrams(15160n)).toBe("15.160");
    expect(formatMgAsGrams(1n)).toBe("0.001");
    expect(formatMgAsGrams(0n)).toBe("0.000");
    expect(formatMgAsGrams(1234567n)).toBe("1,234.567");
  });
});
