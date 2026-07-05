import { describe, expect, it } from "vitest";
import { MockGoldPriceFeedSource } from "@/server/prices/feed-source";
import { priceChangeBasisPoints, serializePrices } from "./price-feed.service";

describe("priceChangeBasisPoints", () => {
  it("คำนวณ % เปลี่ยน (basis points) ถูกต้องทั้งขึ้นและลง", () => {
    // 50,000 → 50,500 = +1% = 100 bp
    expect(priceChangeBasisPoints(5_000_000n, 5_050_000n)).toBe(100n);
    // 50,000 → 49,500 = -1% = 100 bp (ค่าบวกเสมอ)
    expect(priceChangeBasisPoints(5_000_000n, 4_950_000n)).toBe(100n);
    expect(priceChangeBasisPoints(5_000_000n, 5_000_000n)).toBe(0n);
  });

  it("previous เป็น 0 ไม่ throw (คืน 0)", () => {
    expect(priceChangeBasisPoints(0n, 5_000_000n)).toBe(0n);
  });
});

describe("MockGoldPriceFeedSource", () => {
  it("เวลาในรอบ 5 นาทีเดียวกัน → ประกาศเดียวกัน (deterministic, dedupe ได้)", async () => {
    const t1 = new Date("2026-07-05T10:01:00Z");
    const t2 = new Date("2026-07-05T10:04:59Z");
    const q1 = await new MockGoldPriceFeedSource(
      5_100_000n,
      () => t1,
    ).fetchLatest();
    const q2 = await new MockGoldPriceFeedSource(
      5_100_000n,
      () => t2,
    ).fetchLatest();

    expect(q1.announcedAt.getTime()).toBe(q2.announcedAt.getTime());
    expect(q1.barSell).toBe(q2.barSell);
  });

  it("ราคาสมเหตุสมผล: buy < sell, รูปพรรณขายแพงกว่าแท่ง", async () => {
    const q = await new MockGoldPriceFeedSource().fetchLatest();
    expect(q.barBuy).toBeLessThan(q.barSell);
    expect(q.ornamentBuy).toBeLessThan(q.ornamentSell);
    expect(q.ornamentSell).toBeGreaterThan(q.barSell);
  });
});

describe("serializePrices", () => {
  it("แปลง bigint เป็น string สำหรับ JSON", () => {
    expect(
      serializePrices({
        barBuy: 1n,
        barSell: 2n,
        ornamentBuy: 3n,
        ornamentSell: 4n,
      }),
    ).toEqual({
      barBuy: "1",
      barSell: "2",
      ornamentBuy: "3",
      ornamentSell: "4",
    });
  });
});
