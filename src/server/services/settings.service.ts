// อ่านค่า settings แบบ typed พร้อม fallback — คีย์ทั้งหมดรวมไว้ที่ SETTING_KEYS
import type { Db } from "@/server/db";

export const SETTING_KEYS = {
  /** feed เก่ากว่ากี่นาทีถือว่า stale (default 60) */
  priceFeedStaleMinutes: "price.feed_stale_minutes",
  /** ราคาเปลี่ยนเกินกี่ % ให้เตือน (default 1.0) */
  priceChangeAlertPercent: "price.change_alert_percent",
  /** token สำหรับหน้า price board (ว่าง = เปิดสาธารณะใน LAN) */
  priceBoardToken: "price_board.token",
  /** เพดานดอกเบี้ยขายฝากตามกฎหมาย %/ปี (default 15 ตาม ป.พ.พ. มาตรา 654/499) */
  pawnInterestRateCapPercentPerYear: "pawn.interest_rate_cap_percent_per_year",
  /** จำนวนวันผ่อนผันหลังครบกำหนดก่อนอนุมัติทองหลุด (default 7) */
  pawnForfeitGraceDays: "pawn.forfeit_grace_days",
  /** วงเงินขายฝากแนะนำ = % ของราคาตลาดรับซื้อคืน (default 80) */
  pawnLoanToValuePercent: "pawn.loan_to_value_percent",
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
