// Integration: Gold Price Engine — ingest/dedupe, ประกาศราคา, snapshot service
// รวม scenario สำคัญของแผน Phase 2: "feed ล่ม → ระบบยังขายได้ด้วยราคาประกาศล่าสุด + เตือน"
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MockGoldPriceFeedSource } from "@/server/prices/feed-source";
import {
  ingestFeedQuote,
  ingestManualQuote,
} from "@/server/services/price-feed.service";
import { announceShopPrice } from "@/server/services/price-announcement.service";
import {
  buildPriceSnapshot,
  getCurrentShopPrice,
  priceSnapshotSchema,
  snapshotPrice,
} from "@/server/services/price-snapshot.service";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";

let db: TestDb;
let actorId: string;

beforeAll(async () => {
  db = await startTestDb();
  const user = await db.prisma.user.create({
    data: {
      username: "price-tester",
      passwordHash: "$argon2id$dummy",
      displayName: "ทดสอบราคา",
    },
  });
  actorId = user.id;
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("feed ingest + dedupe", () => {
  it("รอบประกาศเดิมไม่ถูกบันทึกซ้ำ", async () => {
    const source = new MockGoldPriceFeedSource();
    const quote = await source.fetchLatest();

    const first = await ingestFeedQuote(db.prisma, quote);
    const second = await ingestFeedQuote(db.prisma, quote);

    expect(first.isNew).toBe(true);
    expect(second.isNew).toBe(false);
    expect(second.feed.id).toBe(first.feed.id);

    const count = await db.prisma.goldPriceFeed.count({
      where: { source: quote.source, announcedAt: quote.announcedAt },
    });
    expect(count).toBe(1);
  });

  it("ปฏิเสธราคาที่ไม่สมเหตุสมผล (buy > sell)", async () => {
    await expect(
      ingestFeedQuote(db.prisma, {
        source: "GTA",
        announcedAt: new Date("2026-01-01T00:00:00Z"),
        barBuy: 5_200_000n,
        barSell: 5_100_000n, // buy > sell — ผิด
        ornamentBuy: 5_000_000n,
        ornamentSell: 5_200_000n,
      }),
    ).rejects.toThrow();
  });

  it("กรอกราคามือ (MANUAL) ได้ + ลง audit log", async () => {
    const feed = await ingestManualQuote(db.prisma, {
      barBuy: 5_090_000n,
      barSell: 5_100_000n,
      ornamentBuy: 5_048_200n,
      ornamentSell: 5_180_000n,
      actorId,
    });
    expect(feed.source).toBe("MANUAL");

    const audit = await db.prisma.auditLog.findFirst({
      where: { action: "price.manual_feed", entityId: feed.id },
    });
    expect(audit).not.toBeNull();
  });
});

describe("ประกาศราคาหน้าร้าน + snapshot", () => {
  it("ยังไม่เคยประกาศ → เปิดบิลไม่ได้ (buildPriceSnapshot โยน error)", async () => {
    // DB ใหม่ยังไม่มีประกาศ ณ จุดนี้
    const current = await getCurrentShopPrice(db.prisma);
    if (current === null) {
      await expect(buildPriceSnapshot(db.prisma)).rejects.toThrow(
        /ยังไม่มีราคาประกาศ/,
      );
    }
  });

  it("ประกาศราคา → snapshot ได้ format มาตรฐาน v1 และอ่านกลับเป็น bigint ได้", async () => {
    const announcement = await announceShopPrice(db.prisma, {
      barBuy: 5_090_000n,
      barSell: 5_105_000n,
      ornamentBuy: 5_050_000n,
      ornamentSell: 5_185_000n,
      actorId,
      note: "ราคาเปิดร้านเช้า",
    });

    const snapshot = await buildPriceSnapshot(db.prisma);
    // ผ่าน zod schema เป๊ะ — format นี้คือสัญญากับทุกโมดูลธุรกรรม
    expect(() => priceSnapshotSchema.parse(snapshot)).not.toThrow();
    expect(snapshot.announcementId).toBe(announcement.id);
    expect(snapshotPrice(snapshot, "ornamentSell")).toBe(5_185_000n);

    const audit = await db.prisma.auditLog.findFirst({
      where: { action: "price.announce", entityId: announcement.id },
    });
    expect(audit).not.toBeNull();
  });

  it("ปฏิเสธประกาศที่รับซื้อแพงกว่าขายออก", async () => {
    await expect(
      announceShopPrice(db.prisma, {
        barBuy: 5_200_000n,
        barSell: 5_100_000n,
        ornamentBuy: 5_000_000n,
        ornamentSell: 5_180_000n,
        actorId,
      }),
    ).rejects.toThrow();
  });
});

describe("scenario: feed ล่ม (แผน §6.2)", () => {
  it("feed เก่าเกิน threshold → ยังได้ราคาประกาศล่าสุด แต่ feedStale=true", async () => {
    // จำลอง: feed ล่าสุดอายุ 2 ชม. (threshold default 60 นาที)
    const twoHoursLater = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const current = await getCurrentShopPrice(db.prisma, twoHoursLater);
    expect(current).not.toBeNull();
    expect(current!.feedStale).toBe(true);
    // ขายได้: snapshot ยังสร้างได้ปกติ
    const snapshot = await buildPriceSnapshot(db.prisma, twoHoursLater);
    expect(priceSnapshotSchema.parse(snapshot)).toBeTruthy();
  });

  it("threshold ปรับได้ผ่าน settings", async () => {
    // ตั้ง threshold ยาว 1 ปี → feed ไม่ stale
    await db.prisma.setting.upsert({
      where: { key: "price.feed_stale_minutes" },
      update: { value: 525_600 },
      create: { key: "price.feed_stale_minutes", value: 525_600 },
    });

    const current = await getCurrentShopPrice(
      db.prisma,
      new Date(Date.now() + 2 * 60 * 60 * 1000),
    );
    expect(current!.feedStale).toBe(false);

    await db.prisma.setting.delete({
      where: { key: "price.feed_stale_minutes" },
    });
  });
});
