// Feed ingest — เก็บทุกประกาศ (append) พร้อม dedupe ที่ unique(source, announcedAt)
import type { Db } from "@/server/db";
import type { GoldPriceFeed, Prisma } from "@/generated/prisma/client";
import type { FeedQuote } from "@/server/prices/feed-source";
import { MANUAL_SOURCE } from "@/server/prices/feed-source";
import { writeAuditLog } from "./audit.service";

/** บันทึกราคา 1 รอบ — รอบเดิม (source+announcedAt ซ้ำ) จะไม่สร้างแถวใหม่ */
export async function ingestFeedQuote(
  db: Db,
  quote: FeedQuote,
): Promise<{ feed: GoldPriceFeed; isNew: boolean }> {
  const existing = await db.goldPriceFeed.findUnique({
    where: {
      source_announcedAt: {
        source: quote.source,
        announcedAt: quote.announcedAt,
      },
    },
  });
  if (existing) return { feed: existing, isNew: false };

  validateQuote(quote);
  const feed = await db.goldPriceFeed.create({
    data: {
      source: quote.source,
      announcedAt: quote.announcedAt,
      barBuy: quote.barBuy,
      barSell: quote.barSell,
      ornamentBuy: quote.ornamentBuy,
      ornamentSell: quote.ornamentSell,
      raw: (quote.raw ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  return { feed, isNew: true };
}

/** กรอกราคามือเมื่อ feed ภายนอกล่ม — ต้องมี permission price.announce + ลง audit */
export async function ingestManualQuote(
  db: Db,
  params: {
    barBuy: bigint;
    barSell: bigint;
    ornamentBuy: bigint;
    ornamentSell: bigint;
    actorId: string;
    requestId?: string | null;
  },
): Promise<GoldPriceFeed> {
  const quote: FeedQuote = {
    source: MANUAL_SOURCE,
    announcedAt: new Date(),
    barBuy: params.barBuy,
    barSell: params.barSell,
    ornamentBuy: params.ornamentBuy,
    ornamentSell: params.ornamentSell,
    raw: { enteredBy: params.actorId },
  };
  validateQuote(quote);

  const feed = await db.goldPriceFeed.create({
    data: {
      source: quote.source,
      announcedAt: quote.announcedAt,
      barBuy: quote.barBuy,
      barSell: quote.barSell,
      ornamentBuy: quote.ornamentBuy,
      ornamentSell: quote.ornamentSell,
      raw: quote.raw as Prisma.InputJsonValue,
    },
  });
  await writeAuditLog(db, {
    action: "price.manual_feed",
    entityType: "gold_price_feed",
    entityId: feed.id,
    actorId: params.actorId,
    requestId: params.requestId,
    after: serializePrices(quote),
  });
  return feed;
}

export async function getLatestFeed(db: Db): Promise<GoldPriceFeed | null> {
  return db.goldPriceFeed.findFirst({ orderBy: { announcedAt: "desc" } });
}

export async function listRecentFeeds(
  db: Db,
  take = 50,
): Promise<GoldPriceFeed[]> {
  return db.goldPriceFeed.findMany({
    orderBy: { announcedAt: "desc" },
    take,
  });
}

/**
 * เปอร์เซ็นต์การเปลี่ยนราคา (basis points, bigint-safe) เทียบ barSell
 * ใช้ตัดสิน alert "ราคาเปลี่ยนแรง" — คืนค่าบวกเสมอ
 */
export function priceChangeBasisPoints(
  previous: bigint,
  current: bigint,
): bigint {
  if (previous <= 0n) return 0n;
  const diff = current > previous ? current - previous : previous - current;
  return (diff * 10_000n) / previous;
}

function validateQuote(quote: FeedQuote): void {
  const prices = [
    quote.barBuy,
    quote.barSell,
    quote.ornamentBuy,
    quote.ornamentSell,
  ];
  if (prices.some((p) => p <= 0n)) {
    throw new Error("ราคาทองต้องมากกว่า 0");
  }
  if (quote.barBuy > quote.barSell) {
    throw new Error("ราคารับซื้อแท่งต้องไม่สูงกว่าราคาขายออก");
  }
}

export function serializePrices(q: {
  barBuy: bigint;
  barSell: bigint;
  ornamentBuy: bigint;
  ornamentSell: bigint;
}): Record<string, string> {
  return {
    barBuy: q.barBuy.toString(),
    barSell: q.barSell.toString(),
    ornamentBuy: q.ornamentBuy.toString(),
    ornamentSell: q.ornamentSell.toString(),
  };
}
