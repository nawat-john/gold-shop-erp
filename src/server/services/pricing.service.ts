// Pricing & VAT Service — ตรรกะประเมินราคาและคำนวณภาษีร้านทอง
// กติกา: เงิน = BIGINT สตางค์, น้ำหนัก = BIGINT มิลลิกรัม
// ภาษีมูลค่าเพิ่ม (VAT 7%) คิดเฉพาะจากฐาน "ค่ากำเหน็จ/ค่าบล็อก" เท่านั้น (ทองคำแท้ได้รับยกเว้นภาษี)

import { MG_PER_BAHT_ORNAMENT, MG_PER_BAHT_BAR } from "@/server/domain/gold";
import { mulDivRoundHalfUp } from "@/server/domain/money";

interface PriceAnnouncement {
  barBuy: bigint; // ราคารับซื้อทองแท่ง สตางค์/บาททอง
  barSell: bigint; // ราคาขายทองแท่ง สตางค์/บาททอง
  ornamentBuy: bigint; // ราคารับซื้อทองรูปพรรณ สตางค์/บาททอง
  ornamentSell: bigint; // ราคาขายทองรูปพรรณ สตางค์/บาททอง
}

interface CalculateSaleParams {
  tracking: "SERIALIZED" | "COUNTED";
  weightMg: bigint;
  goldPurity: number; // e.g. 96.50
  laborChargeSatang: bigint;
  announcement: PriceAnnouncement;
}

interface SalePriceResult {
  baseGoldPriceSatang: bigint;
  laborChargeSatang: bigint;
  vatAmountSatang: bigint;
  totalAmountSatang: bigint;
}

/**
 * คำนวณราคาขายหน้าร้าน (ทองขายออก)
 * สูตร: ราคาเนื้อทอง (อิงตามน้ำหนักและเปอร์เซ็นต์ความบริสุทธิ์เทียบ 96.5%) + ค่ากำเหน็จ
 * ภาษี VAT 7% (คิดแบบ Inclusive) เฉพาะส่วนค่ากำเหน็จ
 */
export function calculateSalePrice({
  tracking,
  weightMg,
  goldPurity,
  laborChargeSatang,
  announcement,
}: CalculateSaleParams): SalePriceResult {
  const isOrnament = tracking === "SERIALIZED";
  const sellPricePerBaht = isOrnament
    ? announcement.ornamentSell
    : announcement.barSell;
  const stdWeightMg = isOrnament ? MG_PER_BAHT_ORNAMENT : MG_PER_BAHT_BAR;

  // คำนวณอัตราส่วนความบริสุทธิ์เทียบกับมาตรฐาน 96.50%
  const purityScaled = BigInt(Math.round(goldPurity * 100)); // 96.50 -> 9650n
  const baseGoldPriceSatang =
    (weightMg * sellPricePerBaht * purityScaled) / (stdWeightMg * 9650n);

  // คำนวณ VAT 7% จากค่ากำเหน็จ (แบบรวมภาษีแล้ว: VAT = labor * 7 / 107)
  const vatAmountSatang = mulDivRoundHalfUp(laborChargeSatang, 7n, 107n);

  const totalAmountSatang = baseGoldPriceSatang + laborChargeSatang;

  return {
    baseGoldPriceSatang,
    laborChargeSatang,
    vatAmountSatang,
    totalAmountSatang,
  };
}

interface CalculateBuybackParams {
  tracking: "SERIALIZED" | "COUNTED";
  weightMg: bigint;
  goldPurity: number;
  announcement: PriceAnnouncement;
}

/**
 * คำนวณราคารับซื้อทองคืน (ทองซื้อเข้า)
 * สูตร: (น้ำหนัก มก. * ราคารับซื้อสมาคม * อัตราส่วนความบริสุทธิ์) / น้ำหนัก 1 บาททอง
 * หมายเหตุ: ซื้อทองเก่าจากลูกค้าไม่มีการหักภาษีมูลค่าเพิ่ม (VAT Exempt)
 */
export function calculateBuybackPrice({
  tracking,
  weightMg,
  goldPurity,
  announcement,
}: CalculateBuybackParams): bigint {
  const isOrnament = tracking === "SERIALIZED";
  const buyPricePerBaht = isOrnament
    ? announcement.ornamentBuy
    : announcement.barBuy;
  const stdWeightMg = isOrnament ? MG_PER_BAHT_ORNAMENT : MG_PER_BAHT_BAR;

  const purityScaled = BigInt(Math.round(goldPurity * 100)); // 96.50 -> 9650n
  return (weightMg * buyPricePerBaht * purityScaled) / (stdWeightMg * 9650n);
}

/**
 * คำนวณรายการเปลี่ยนทอง (Trade-in)
 * ผลต่างสุทธิ = ยอดบิลขาย - ยอดบิลรับซื้อทองเก่า
 * ผลลัพธ์:
 * - ค่าเป็นบวก: ลูกค้าต้องชำระเงินเพิ่มให้ร้าน
 * - ค่าเป็นลบ: ร้านต้องคืนเงินส่วนต่างให้ลูกค้า
 */
export function calculateTradeInNet(
  salesOrderTotal: bigint,
  purchaseOrderTotal: bigint,
): bigint {
  return salesOrderTotal - purchaseOrderTotal;
}
