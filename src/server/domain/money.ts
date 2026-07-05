// กติกาเงินทั้งระบบ (ADR-002): เก็บเป็น "สตางค์" ชนิด bigint เท่านั้น
// ห้ามใช้ number/float กับค่าเงินเด็ดขาด — number ใช้ได้เฉพาะตอนแสดงผลฝั่ง UI

/** จำนวนเงินหน่วยสตางค์ (1 บาท = 100 สตางค์) */
export type Satang = bigint;

export const SATANG_PER_BAHT = 100n;

const BAHT_STRING_PATTERN = /^-?\d{1,12}(\.\d{1,2})?$/;

/**
 * แปลง string จำนวนเงินบาท (เช่น "1234.50") เป็นสตางค์
 * รับเฉพาะทศนิยมไม่เกิน 2 ตำแหน่ง — ปฏิเสธ input ที่ละเอียดกว่านั้น ไม่ปัดเงียบ ๆ
 */
export function satangFromBahtString(input: string): Satang {
  const normalized = input.replace(/,/g, "").trim();
  if (!BAHT_STRING_PATTERN.test(normalized)) {
    throw new Error(`จำนวนเงินไม่ถูกต้อง: "${input}"`);
  }
  const negative = normalized.startsWith("-");
  const [wholePart, fractionPart = ""] = (
    negative ? normalized.slice(1) : normalized
  ).split(".");
  const satang =
    BigInt(wholePart) * SATANG_PER_BAHT + BigInt(fractionPart.padEnd(2, "0"));
  return negative ? -satang : satang;
}

/** แสดงผลสตางค์เป็น string บาท เช่น 123450n → "1,234.50" */
export function formatSatangAsBaht(satang: Satang): string {
  const negative = satang < 0n;
  const abs = negative ? -satang : satang;
  const baht = (abs / SATANG_PER_BAHT).toLocaleString("en-US");
  const fraction = (abs % SATANG_PER_BAHT).toString().padStart(2, "0");
  return `${negative ? "-" : ""}${baht}.${fraction}`;
}

/**
 * คูณ-หารจำนวนเงินแบบปัดเศษครึ่งขึ้น (round half up) ที่หน่วยสตางค์
 * ใช้กับการคิดสัดส่วน เช่น VAT 7% = mulDiv(amount, 7n, 100n)
 */
export function mulDivRoundHalfUp(
  amount: Satang,
  numerator: bigint,
  denominator: bigint,
): Satang {
  if (denominator <= 0n) {
    throw new Error("denominator ต้องมากกว่า 0");
  }
  const product = amount * numerator;
  const negative = product < 0n;
  const absProduct = negative ? -product : product;
  const rounded = (absProduct * 2n + denominator) / (denominator * 2n);
  return negative ? -rounded : rounded;
}
