# ADR-002: กติกาการเก็บเงินและน้ำหนักทอง

- **สถานะ:** Accepted (2026-07-05)
- **บริบท:** ระบบเกี่ยวกับเงินและทองมูลค่าสูง — ความคลาดเคลื่อนจาก floating point ยอมรับไม่ได้

## การตัดสินใจ

### เงิน

- **DB:** `BIGINT` หน่วย **สตางค์** (1 บาท = 100 สตางค์)
- **TypeScript:** `bigint` (type alias `Satang` ใน `src/server/domain/money.ts`)
- **ห้าม** ใช้ `number`/float กับค่าเงินทุกกรณี — `number` ใช้ได้เฉพาะการแสดงผลฝั่ง UI ที่ไม่ถูกส่งกลับมา server
- การปัดเศษ: **round half up ที่หน่วยสตางค์** ผ่าน `mulDivRoundHalfUp()` เท่านั้น (ใช้กับ VAT, ส่วนลด, ดอกเบี้ย)
- Input จากผู้ใช้: parse ด้วย `satangFromBahtString()` — ปฏิเสธทศนิยมเกิน 2 ตำแหน่ง ไม่ปัดเงียบ

### น้ำหนักทอง

- **DB:** `NUMERIC(10,3)` หน่วย **กรัม** (ทศนิยม 3 ตำแหน่ง = ความละเอียดระดับมิลลิกรัม)
- **TypeScript:** `bigint` หน่วย **มิลลิกรัม** (type alias `Milligrams` ใน `src/server/domain/gold.ts`) — แปลงที่ boundary ระหว่างแอปกับ DB
- หน่วยบาท/สลึง เป็น **หน่วยแสดงผลเท่านั้น** เก็บเป็น field แยก — การคำนวณทั้งหมดทำที่มิลลิกรัม
- ค่าคงที่: 1 บาททองรูปพรรณ = 15.16 g (15,160 mg), 1 บาททองแท่ง = 15.244 g (15,244 mg), 1 สลึงรูปพรรณ = 3.79 g

### ทุกตารางธุรกรรม

- ต้องมี `created_by`, `created_at`, `branch_id`, `price_snapshot` (JSONB ราคาทอง ณ ขณะทำรายการ)
- ห้ามลบ/แก้เอกสารที่ปิดแล้ว — ใช้ status + เอกสารกลับรายการ (void/reversal) เท่านั้น
- Soft delete ใช้ได้เฉพาะ master data

## เหตุผล

- `bigint` + integer arithmetic ไม่มี rounding error สะสม, เทียบเท่า `BIGINT` ของ Postgres แบบ 1:1 (Prisma map `BigInt` ↔ `bigint` ให้อยู่แล้ว)
- มิลลิกรัมเป็น integer ทำให้น้ำหนักบวกลบคูณหารไม่เพี้ยน และ round-trip กับ `NUMERIC(10,3)` ได้พอดี

## ผลกระทบ

- tsconfig ต้อง target ≥ ES2020 (ตั้งไว้ ES2022)
- ทุกสูตรเงิน/น้ำหนักต้องมี unit test (golden cases เทียบการคำนวณมือ) — ดูตัวอย่างใน `money.test.ts`, `gold.test.ts`
