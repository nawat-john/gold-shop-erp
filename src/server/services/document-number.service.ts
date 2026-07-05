// Document Number Service — เลขที่เอกสารแบบ no-gap (บิล/ใบกำกับภาษี/สัญญา)
//
// หลักการ: จองเลขด้วย atomic upsert ภายใน "transaction เดียวกับการสร้างเอกสาร" เสมอ
// - แถว sequence ถูก lock จนกว่า tx จะ commit → คำขอพร้อมกันถูกจัดคิวต่อ key ไม่มีเลขซ้ำ
// - ถ้า tx rollback การเพิ่มเลขก็ rollback ด้วย → ไม่มีเลขข้าม (สำคัญต่อใบกำกับภาษี)
// ห้ามจองเลขนอก transaction ของเอกสาร เพราะจะเกิด gap เมื่อสร้างเอกสารล้มเหลว
import type { Prisma } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

/** สร้าง key ของ sequence เช่น buildSequenceKey("TAXINV", "BKK01", 2569) → "TAXINV-BKK01-2569" */
export function buildSequenceKey(
  docType: string,
  branchCode: string,
  yearBE: number,
): string {
  if (!/^[A-Z0-9]+$/.test(docType) || !/^[A-Z0-9]+$/.test(branchCode)) {
    throw new Error(
      `sequence key ต้องเป็น A-Z/0-9 เท่านั้น: "${docType}", "${branchCode}"`,
    );
  }
  if (!Number.isInteger(yearBE) || yearBE < 2500 || yearBE > 2700) {
    throw new Error(`ปี พ.ศ. ไม่ถูกต้อง: ${yearBE}`);
  }
  return `${docType}-${branchCode}-${yearBE}`;
}

/**
 * จองเลขที่เอกสารถัดไปของ key ที่กำหนด — ต้องเรียกภายใน prisma.$transaction เท่านั้น
 * คืนเลขลำดับ (เริ่มที่ 1) — เลขจะผูกพันจริงเมื่อ tx commit
 */
export async function allocateDocumentNumber(
  tx: Tx,
  key: string,
): Promise<bigint> {
  const rows = await tx.$queryRaw<{ number: bigint }[]>`
    INSERT INTO document_sequences (key, next_number, updated_at)
    VALUES (${key}, 2, now())
    ON CONFLICT (key) DO UPDATE
      SET next_number = document_sequences.next_number + 1,
          updated_at  = now()
    RETURNING next_number - 1 AS number
  `;
  return rows[0].number;
}

/** จัดรูปเลขเอกสารเพื่อแสดงผล/พิมพ์ เช่น ("INV-BKK01-2569", 42n) → "INV-BKK01-2569-000042" */
export function formatDocumentNumber(
  key: string,
  number: bigint,
  width = 6,
): string {
  if (number <= 0n) {
    throw new Error(`เลขเอกสารต้องมากกว่า 0: ${number}`);
  }
  return `${key}-${number.toString().padStart(width, "0")}`;
}
