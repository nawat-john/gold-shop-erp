// กติกาน้ำหนักทองทั้งระบบ (ADR-002): เก็บเป็น "มิลลิกรัม" ชนิด bigint
// ตรงกับคอลัมน์ DB NUMERIC(10,3) หน่วยกรัม (ทศนิยม 3 ตำแหน่ง = มิลลิกรัมพอดี)
// หน่วยบาท/สลึง เป็นแค่หน่วยแสดงผล — การคำนวณทั้งหมดทำที่มิลลิกรัม

/** น้ำหนักทองหน่วยมิลลิกรัม (1 กรัม = 1,000 มก.) */
export type Milligrams = bigint;

/** ทองรูปพรรณ: 1 บาททอง = 15.16 กรัม */
export const MG_PER_BAHT_ORNAMENT = 15160n;
/** ทองแท่ง: 1 บาททอง = 15.244 กรัม */
export const MG_PER_BAHT_BAR = 15244n;
/** 1 สลึง (รูปพรรณ) = 3.79 กรัม */
export const MG_PER_SALUNG_ORNAMENT = MG_PER_BAHT_ORNAMENT / 4n;

export type GoldForm = "ornament" | "bar";

const GRAM_STRING_PATTERN = /^\d{1,7}(\.\d{1,3})?$/;

/** แปลง string น้ำหนักกรัม (เช่น "15.16") เป็นมิลลิกรัม — ทศนิยมไม่เกิน 3 ตำแหน่ง */
export function mgFromGramString(input: string): Milligrams {
  const normalized = input.replace(/,/g, "").trim();
  if (!GRAM_STRING_PATTERN.test(normalized)) {
    throw new Error(`น้ำหนักไม่ถูกต้อง: "${input}"`);
  }
  const [wholePart, fractionPart = ""] = normalized.split(".");
  return BigInt(wholePart) * 1000n + BigInt(fractionPart.padEnd(3, "0"));
}

/** แปลงจำนวนบาททอง (จำนวนเต็ม) เป็นมิลลิกรัม ตามประเภททอง */
export function mgFromBahtGold(baht: bigint, form: GoldForm): Milligrams {
  const perBaht = form === "ornament" ? MG_PER_BAHT_ORNAMENT : MG_PER_BAHT_BAR;
  return baht * perBaht;
}

/** แสดงผลมิลลิกรัมเป็น string กรัมทศนิยม 3 ตำแหน่ง เช่น 15160n → "15.160" */
export function formatMgAsGrams(mg: Milligrams): string {
  const negative = mg < 0n;
  const abs = negative ? -mg : mg;
  const grams = abs / 1000n;
  const fraction = (abs % 1000n).toString().padStart(3, "0");
  return `${negative ? "-" : ""}${grams.toLocaleString("en-US")}.${fraction}`;
}
