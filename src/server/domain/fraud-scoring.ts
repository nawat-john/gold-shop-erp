// Fraud Scoring — สูตรคำนวณล้วน (pure functions) สำหรับ fraud dashboard (Phase 8)
// แยกจาก fraud-report.service.ts (ที่ทำหน้าที่ query ข้อมูล) เพื่อให้ทดสอบ edge case ได้ครบโดยไม่ต้องแตะ DB

/** อัตราการ void เป็น % ของยอดทั้งหมด — คืน 0 ถ้าไม่มีรายการเลย (กันหารด้วยศูนย์) */
export function computeVoidRatePercent(
  voidCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) return 0;
  return (voidCount / totalCount) * 100;
}

/**
 * ตัดสินว่าอัตรา void ของพนักงานคนนี้ผิดปกติหรือไม่
 * ต้องมีจำนวนรายการขั้นต่ำ (minSampleSize) ด้วย กันพนักงานที่เพิ่งขาย 1 บิลแล้ว void
 * ถูกตีตราว่าผิดปกติ (100% ของตัวอย่างเดียว ไม่มีนัยสำคัญทางสถิติ)
 */
export function isVoidRateAnomalous(params: {
  voidCount: number;
  totalCount: number;
  thresholdPercent: number;
  minSampleSize: number;
}): boolean {
  const { voidCount, totalCount, thresholdPercent, minSampleSize } = params;
  if (totalCount < minSampleSize) return false;
  return computeVoidRatePercent(voidCount, totalCount) > thresholdPercent;
}

/** ตัดสินว่าจำนวนครั้งที่อนุมัติปรับสต๊อกของคนนี้ในช่วงเวลาที่ดูผิดปกติหรือไม่ */
export function isStockAdjustCountAnomalous(
  approvalCount: number,
  thresholdCount: number,
): boolean {
  return approvalCount > thresholdCount;
}

/** เวลานี้อยู่นอกเวลาทำการหรือไม่ (ค่าเริ่มต้น 08:00–20:00 ตามเวลาเครื่อง) */
export function isOffHours(
  date: Date,
  businessStartHour = 8,
  businessEndHour = 20,
): boolean {
  const hour = date.getHours();
  return hour < businessStartHour || hour >= businessEndHour;
}
