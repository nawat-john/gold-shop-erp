// อ่านค่า settings แบบ typed พร้อม fallback — คีย์ทั้งหมดรวมไว้ที่ SETTING_KEYS
import type { Db } from "@/server/db";

export const SETTING_KEYS = {
  /** feed เก่ากว่ากี่นาทีถือว่า stale (default 60) */
  priceFeedStaleMinutes: "price.feed_stale_minutes",
  /** ราคาเปลี่ยนเกินกี่ % ให้เตือน (default 1.0) */
  priceChangeAlertPercent: "price.change_alert_percent",
  /** token สำหรับหน้า price board (ว่าง = เปิดสาธารณะใน LAN) */
  priceBoardToken: "price_board.token",
} as const;

export async function getNumberSetting(
  db: Db,
  key: string,
  fallback: number,
): Promise<number> {
  const setting = await db.setting.findUnique({ where: { key } });
  if (!setting) return fallback;
  const value = Number(setting.value);
  return Number.isFinite(value) ? value : fallback;
}

export async function getStringSetting(
  db: Db,
  key: string,
  fallback: string,
): Promise<string> {
  const setting = await db.setting.findUnique({ where: { key } });
  if (!setting) return fallback;
  return typeof setting.value === "string" ? setting.value : fallback;
}
