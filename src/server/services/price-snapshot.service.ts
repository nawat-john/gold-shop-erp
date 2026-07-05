// Price Snapshot Service — จุดเดียวที่โมดูลธุรกรรมทุกตัว (POS/ขายฝาก/ออมทอง) ใช้อ่านราคา
// กติกา (แผน §1.3): ราคา ณ เวลาทำรายการต้อง snapshot ติดบิลเป็น JSONB — ห้ามอ้างราคาปัจจุบันย้อนหลัง
//
// Reliability (แผน §6.2): feed ภายนอกล่ม → ระบบยังขายได้ด้วยราคาประกาศล่าสุด + ธง stale เตือน
import { z } from "zod";
import type { Db } from "@/server/db";
import type { ShopPriceAnnouncement } from "@/generated/prisma/client";
import { getCurrentAnnouncement } from "./price-announcement.service";
import { getLatestFeed } from "./price-feed.service";
import { SETTING_KEYS, getNumberSetting } from "./settings.service";

/// รูปแบบ snapshot มาตรฐาน (version 1) — bigint เก็บเป็น string เพราะ JSON ไม่มี bigint
export const priceSnapshotSchema = z.object({
  version: z.literal(1),
  announcementId: z.string(),
  announcedAt: z.iso.datetime(),
  capturedAt: z.iso.datetime(),
  currency: z.literal("THB_SATANG"),
  unit: z.literal("per_baht_gold"),
  barBuy: z.string().regex(/^\d+$/),
  barSell: z.string().regex(/^\d+$/),
  ornamentBuy: z.string().regex(/^\d+$/),
  ornamentSell: z.string().regex(/^\d+$/),
});

export type PriceSnapshot = z.infer<typeof priceSnapshotSchema>;

export interface CurrentShopPrice {
  announcement: ShopPriceAnnouncement;
  /** true = feed ภายนอกเก่าเกิน threshold หรือไม่มีเลย — UI ต้องแสดง banner เตือน */
  feedStale: boolean;
  /** เวลาของ feed ล่าสุด (null = ไม่เคยมี feed) */
  latestFeedAt: Date | null;
}

/**
 * ราคาปัจจุบันของร้าน — ใช้ได้เสมอถ้าเคยมีประกาศอย่างน้อย 1 ครั้ง
 * feed ล่มไม่กระทบการขาย แค่ตั้งธง feedStale ให้เตือน
 */
export async function getCurrentShopPrice(
  db: Db,
  now: Date = new Date(),
): Promise<CurrentShopPrice | null> {
  const announcement = await getCurrentAnnouncement(db);
  if (!announcement) return null;

  const staleMinutes = await getNumberSetting(
    db,
    SETTING_KEYS.priceFeedStaleMinutes,
    60,
  );
  const latestFeed = await getLatestFeed(db);
  const feedStale =
    !latestFeed ||
    now.getTime() - latestFeed.announcedAt.getTime() > staleMinutes * 60 * 1000;

  return {
    announcement,
    feedStale,
    latestFeedAt: latestFeed?.announcedAt ?? null,
  };
}

/**
 * สร้าง snapshot สำหรับตราลงบิล — เรียกภายใน transaction ของธุรกรรมเสมอ
 * โยน error เมื่อร้านยังไม่เคยประกาศราคา (เปิดบิลไม่ได้)
 */
export async function buildPriceSnapshot(
  db: Db,
  now: Date = new Date(),
): Promise<PriceSnapshot> {
  const current = await getCurrentShopPrice(db, now);
  if (!current) {
    throw new Error("ยังไม่มีราคาประกาศของร้าน — ประกาศราคาก่อนเปิดบิล");
  }
  const a = current.announcement;
  return {
    version: 1,
    announcementId: a.id,
    announcedAt: a.announcedAt.toISOString(),
    capturedAt: now.toISOString(),
    currency: "THB_SATANG",
    unit: "per_baht_gold",
    barBuy: a.barBuy.toString(),
    barSell: a.barSell.toString(),
    ornamentBuy: a.ornamentBuy.toString(),
    ornamentSell: a.ornamentSell.toString(),
  };
}

/** อ่านราคาจาก snapshot กลับเป็น bigint (ใช้ตอน void/reversal ที่ต้องคำนวณจากราคาเดิม) */
export function snapshotPrice(
  snapshot: PriceSnapshot,
  field: "barBuy" | "barSell" | "ornamentBuy" | "ornamentSell",
): bigint {
  return BigInt(snapshot[field]);
}
