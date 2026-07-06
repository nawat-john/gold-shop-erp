import { describe, expect, it } from "vitest";
import { isAboveAmloThreshold } from "./amlo";

describe("AMLO threshold rule", () => {
  it("จำนวนเงินต่ำกว่าเพดาน -> ไม่เข้าเกณฑ์", () => {
    expect(isAboveAmloThreshold(199_999_99n, 200_000_000n)).toBe(false);
  });

  it("จำนวนเงินเท่ากับเพดานพอดี -> เข้าเกณฑ์ (เกณฑ์รวมค่าเท่ากับเพดาน)", () => {
    expect(isAboveAmloThreshold(200_000_000n, 200_000_000n)).toBe(true);
  });

  it("จำนวนเงินสูงกว่าเพดาน -> เข้าเกณฑ์", () => {
    expect(isAboveAmloThreshold(300_000_000n, 200_000_000n)).toBe(true);
  });

  it("เพดานเป็น 0 -> ทุกธุรกรรมที่มีมูลค่ามากกว่า 0 เข้าเกณฑ์เสมอ", () => {
    expect(isAboveAmloThreshold(1n, 0n)).toBe(true);
    expect(isAboveAmloThreshold(0n, 0n)).toBe(true);
  });
});
