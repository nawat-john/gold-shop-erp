// งานดึงราคาทอง — logic แยกจาก BullMQ worker เพื่อให้เรียกตรงได้ด้วย
// (ปุ่ม "ดึงราคาตอนนี้" ในหน้า admin ใช้ฟังก์ชันเดียวกัน ไม่ต้องผ่าน queue)
import { logger } from "@/lib/logger";
import type { Db } from "@/server/db";
import type { GoldPriceFeedSource } from "@/server/prices/feed-source";
import {
  getLatestFeed,
  ingestFeedQuote,
  priceChangeBasisPoints,
} from "@/server/services/price-feed.service";
import {
  SETTING_KEYS,
  getNumberSetting,
} from "@/server/services/settings.service";

export interface FetchResult {
  feedId: string;
  isNew: boolean;
  /** การเปลี่ยนแปลง barSell เทียบ feed ก่อนหน้า (basis points) */
  changeBasisPoints: bigint;
  /** true = เปลี่ยนเกิน threshold — ควรแจ้งเตือน */
  alert: boolean;
}

export async function fetchAndIngestGoldPrice(
  db: Db,
  source: GoldPriceFeedSource,
): Promise<FetchResult> {
  const previous = await getLatestFeed(db);
  const quote = await source.fetchLatest();
  const { feed, isNew } = await ingestFeedQuote(db, quote);

  let changeBasisPoints = 0n;
  let alert = false;
  if (isNew && previous) {
    changeBasisPoints = priceChangeBasisPoints(previous.barSell, feed.barSell);
    const thresholdPercent = await getNumberSetting(
      db,
      SETTING_KEYS.priceChangeAlertPercent,
      1.0,
    );
    const thresholdBp = BigInt(Math.round(thresholdPercent * 100));
    alert = changeBasisPoints >= thresholdBp;
    if (alert) {
      logger.warn(
        {
          feedId: feed.id,
          previousBarSell: previous.barSell.toString(),
          currentBarSell: feed.barSell.toString(),
          changeBasisPoints: changeBasisPoints.toString(),
        },
        "ราคาทองเปลี่ยนเกิน threshold",
      );
    }
  }

  return { feedId: feed.id, isNew, changeBasisPoints, alert };
}
