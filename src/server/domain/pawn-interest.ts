// สูตรดอกเบี้ยขายฝาก (ขายฝากทองไม่ใช่โรงรับจำนำมีใบอนุญาต — อิงเพดานดอกเบี้ยทั่วไป ป.พ.พ. มาตรา 654
// และหลักการสินไถ่ขายฝากมาตรา 499: ห้ามเกินราคาขายฝากบวกดอกเบี้ยตามเพดานต่อปี)
// ดอกเบี้ยคิดแบบ simple interest เทียบสัดส่วนวันจริงที่ผ่านไป (เศษวัน) ไม่ทบต้น
// กติกา: เงิน = BIGINT สตางค์ เท่านั้น ห้าม float
import { mulDivRoundHalfUp, type Satang } from "./money";

const DAYS_PER_YEAR = 365n;
/// รองรับทศนิยม 2 ตำแหน่งของอัตราดอกเบี้ย (เช่น 15.00% -> 1500)
const RATE_SCALE = 10000n;

/** จำนวนวันเต็มระหว่างสองวันที่ (toDate ต้องไม่ก่อน fromDate ปกติ — ถ้าติดลบคืน 0 ที่ชั้นคำนวณดอกเบี้ย) */
export function daysBetween(fromDate: Date, toDate: Date): number {
  const ms = toDate.getTime() - fromDate.getTime();
  return Math.floor(ms / 86_400_000);
}

/**
 * เพิ่มจำนวนเดือนให้วันที่ (ใช้กำหนด due date เริ่มต้น/ต่อดอก)
 * วันที่เกินจำนวนวันของเดือนปลายทาง (เช่น 31 ม.ค. + 1 เดือน) จะถูกปรับเป็นวันสุดท้ายของเดือนนั้น
 * แทนที่จะปล่อยให้ JS Date เลื่อนล้นไปเดือนถัดไปเอง
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const daysInTargetMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(originalDay, daysInTargetMonth));
  return result;
}

/**
 * ตรวจสอบอัตราดอกเบี้ยที่ตกลงกันต้องไม่เกินเพดานตามกฎหมาย (%/ปี)
 * โยน error ทันทีถ้าเกิน — ห้ามเงียบแล้วปัดลดให้เอง
 */
export function validateInterestRate(
  annualRatePercent: number,
  capPercent: number,
): void {
  if (annualRatePercent < 0) {
    throw new Error("อัตราดอกเบี้ยห้ามติดลบ");
  }
  if (annualRatePercent > capPercent) {
    throw new Error(
      `อัตราดอกเบี้ย ${annualRatePercent}% ต่อปี เกินเพดานตามกฎหมาย (${capPercent}% ต่อปี)`,
    );
  }
}

export interface AccrueInterestParams {
  principalSatang: Satang;
  /** อัตราดอกเบี้ยต่อปี เช่น 15 = 15% ต่อปี */
  annualRatePercent: number;
  fromDate: Date;
  toDate: Date;
}

/**
 * คำนวณดอกเบี้ยค้างแบบ simple interest เศษวันจริง (Actual/365)
 * สูตร: เงินต้น * (อัตรา% / 100) * (จำนวนวัน / 365) ปัดเศษครึ่งขึ้นเป็นสตางค์
 * ถ้าจำนวนวัน <= 0 คืน 0 (ไม่มีดอกเบี้ยเกิดขึ้น)
 */
export function calculateAccruedInterest({
  principalSatang,
  annualRatePercent,
  fromDate,
  toDate,
}: AccrueInterestParams): Satang {
  const days = daysBetween(fromDate, toDate);
  if (days <= 0) return 0n;

  const rateScaled = BigInt(Math.round(annualRatePercent * 100)); // 15.00 -> 1500
  return mulDivRoundHalfUp(
    principalSatang,
    rateScaled * BigInt(days),
    RATE_SCALE * DAYS_PER_YEAR,
  );
}

/** ยอดสินไถ่รวม = เงินต้น + ดอกเบี้ยค้างที่ยังไม่ได้ชำระ */
export function calculateRedemptionAmount(
  principalSatang: Satang,
  accruedInterestSatang: Satang,
): Satang {
  return principalSatang + accruedInterestSatang;
}
