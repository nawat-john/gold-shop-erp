// สูตร/กติกา AMLO ล้วนๆ (ไม่แตะ DB) — แยกออกมาให้เทสต์ง่ายและ service เรียกใช้ซ้ำได้
import type { Satang } from "./money";

/** ธุรกรรมเงินสด >= เพดาน ต้องบังคับ KYC + แจ้งเตือน AMLO (เท่ากับเพดานพอดีถือว่าเข้าเกณฑ์) */
export function isAboveAmloThreshold(
  amountSatang: Satang,
  thresholdSatang: Satang,
): boolean {
  return amountSatang >= thresholdSatang;
}
