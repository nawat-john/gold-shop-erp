// สูตรแปลงเงิน<->น้ำหนักทองสำหรับบัญชีออมทอง (ไม่แตะ DB)
// กติกา: ฝากเงิน (ออมเงิน/ออมน้ำหนัก) แปลงด้วยราคาขายออก (ลูกค้าซื้อทอง)
//        ปิดบัญชีคืนเงิน (ยกเลิก/ผิดนัด) แปลงด้วยราคารับซื้อคืน (ร้านซื้อทองคืน) — กันร้านขาดทุนจากส่วนต่าง
import { MG_PER_BAHT_ORNAMENT, type Milligrams } from "./gold";
import type { Satang } from "./money";

/** แปลงเงินสดเป็นน้ำหนักทอง (ใช้ราคาขายออก ณ เวลาฝาก/ปิดบัญชีรับทอง) */
export function convertCashToWeightMg(
  amountSatang: Satang,
  sellPriceSatangPerBaht: bigint,
): Milligrams {
  if (sellPriceSatangPerBaht <= 0n) {
    throw new Error("ราคาทองต้องมากกว่า 0");
  }
  return (amountSatang * MG_PER_BAHT_ORNAMENT) / sellPriceSatangPerBaht;
}

/** แปลงน้ำหนักทองเป็นเงินสด (ใช้ราคารับซื้อคืน ณ เวลาปิดบัญชีคืนเงิน) */
export function convertWeightToCashSatang(
  weightMg: Milligrams,
  buyPriceSatangPerBaht: bigint,
): Satang {
  if (buyPriceSatangPerBaht <= 0n) {
    throw new Error("ราคาทองต้องมากกว่า 0");
  }
  return (weightMg * buyPriceSatangPerBaht) / MG_PER_BAHT_ORNAMENT;
}
