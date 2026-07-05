# แผนออกแบบและพัฒนาระบบ ERP ร้านทองไทยแบบครบวงจร (Gold Shop ERP)

> **ขอบเขต:** ออกแบบ + พัฒนาบน Local Development เท่านั้น (ยังไม่รวม Deployment)
> **Interface:** Web Application ด้วย Next.js
> **จุดเน้น:** Reliability และ Security เป็นอันดับหนึ่ง เพราะเป็นระบบที่เกี่ยวข้องกับเงินและทองมูลค่าสูง

---

## 1. ภาพรวมโครงการ (Project Overview)

### 1.1 เป้าหมาย

สร้างระบบ ERP ที่ครอบคลุมทุกกระบวนการของร้านทองไทย ตั้งแต่หน้าร้าน (POS ซื้อ-ขาย), ขายฝาก/จำนำ, ออมทอง, สต๊อกสินค้า, บัญชี-ภาษี, ลูกค้า (CRM + KYC), ไปจนถึงรายงานผู้บริหาร รองรับหลายสาขา หลายผู้ใช้ พร้อม Audit Trail ครบทุกธุรกรรม

### 1.2 ผู้ใช้งานหลัก (User Roles)

| Role                           | หน้าที่                                | สิทธิ์หลัก                                       |
| ------------------------------ | -------------------------------------- | ------------------------------------------------ |
| เจ้าของร้าน (Owner)            | ดูภาพรวม, อนุมัติ, ตั้งค่าระบบ         | ทุกอย่าง + ดู Audit Log                          |
| ผู้จัดการสาขา (Branch Manager) | บริหารสาขา, อนุมัติรายการพิเศษ, ปิดยอด | จัดการสาขาตัวเอง, override ราคา (มี log)         |
| พนักงานขาย (Cashier/Sales)     | ซื้อ-ขายหน้าร้าน, รับขายฝาก            | เปิดบิล, รับ-จ่ายเงิน, ห้ามแก้ราคาเกิน threshold |
| พนักงานสต๊อก (Stock Keeper)    | รับเข้า-ตัดจ่าย, นับสต๊อก              | จัดการสต๊อก, พิมพ์ป้าย/บาร์โค้ด                  |
| ฝ่ายบัญชี (Accountant)         | กระทบยอด, ภาษี, งบการเงิน              | ดู/ปิดบัญชี, ออกใบกำกับภาษี                      |
| ผู้ดูแลระบบ (Admin)            | จัดการ user, สิทธิ์, ตั้งค่า           | User management, ไม่จำเป็นต้องเห็นข้อมูลการเงิน  |

### 1.3 หลักการออกแบบ (Design Principles)

1. **ทุกธุรกรรมเงิน/ทองต้องเป็น Double-Entry + Immutable** — ห้ามลบ/แก้บิลที่ปิดแล้ว ใช้วิธีออกเอกสารกลับรายการ (Void/Reversal) เท่านั้น
2. **ราคาทอง ณ เวลาทำรายการต้อง Snapshot ติดไปกับบิล** — ไม่อ้างอิงราคาปัจจุบันย้อนหลัง
3. **น้ำหนักทองเก็บเป็นหน่วยที่แม่นยำที่สุด (กรัม, ทศนิยม 3–4 ตำแหน่ง)** และเงินเก็บเป็นสตางค์ (integer) — ห้ามใช้ floating point กับเงินเด็ดขาด
4. **Least Privilege + Audit Everything** — ทุก action ที่กระทบเงิน/ทอง/ข้อมูลลูกค้า ต้องมี audit log ที่แก้ไขไม่ได้
5. **Offline-tolerant mindset** — ออกแบบให้ระบบ local ทำงานได้แม้ API ราคาทองภายนอกล่ม (ใช้ราคา manual override ที่มี log)

---

## 2. ความรู้เฉพาะโดเมนร้านทองไทย (Domain Knowledge)

ส่วนนี้สำคัญมาก เพราะตรรกะทางธุรกิจของร้านทองไทยต่างจาก retail ทั่วไป

### 2.1 หน่วยน้ำหนักและความบริสุทธิ์

- **1 บาททอง (ทองรูปพรรณ) = 15.16 กรัม** / **1 บาททอง (ทองแท่ง) = 15.244 กรัม**
- 1 บาท = 4 สลึง, 1 สลึง = 3.79 กรัม (รูปพรรณ), หน่วยย่อย: 2 สลึง (ครึ่งบาท), 1 สลึง, ครึ่งสลึง, 1 กรัม
- มาตรฐานไทย: **ทอง 96.5%** (ทองรูปพรรณ/ทองแท่งทั่วไป), ทอง 99.99% (ทองคำแท่ง LBMA/นำเข้า), ทอง 90%, ทองเค (9K/14K/18K) สำหรับจิวเวลรี่
- ระบบต้องเก็บ: น้ำหนักกรัม (ตัวเลขจริง), หน่วยแสดงผล (บาท/สลึง/กรัม), % ความบริสุทธิ์ (fineness)

### 2.2 โครงสร้างราคา

- **ราคาสมาคมค้าทองคำ** ประกาศราคารับซื้อ/ขายออก ทองแท่งและทองรูปพรรณ เปลี่ยนได้หลายรอบต่อวัน → ต้องมีตาราง `gold_price_history` เก็บทุกประกาศ
- **ราคาขายทองรูปพรรณ = (ราคาทองรูปพรรณขายออก × น้ำหนักบาท) + ค่ากำเหน็จ (labor charge)**
- **ราคารับซื้อคืน** ต่ำกว่าราคาขาย และมักหักตามสภาพ/ความบริสุทธิ์จริง (ทองร้านตัวเอง vs ทองร้านอื่น รับซื้อคนละเรต)
- ค่ากำเหน็จกำหนดได้หลายแบบ: ต่อชิ้น, ต่อบาททอง, ตามหมวดสินค้า → ต้อง configurable

### 2.3 ประเภทธุรกรรมหลัก

1. **ขายทองใหม่** (รูปพรรณ/แท่ง)
2. **รับซื้อทองเก่า** (ทองร้านตัวเอง = ดูจากใบรับประกัน/ตอกโค้ด, ทองร้านอื่น)
3. **เปลี่ยนทอง (Trade-in)** — เอาทองเก่ามาแลกทองใหม่ จ่าย/รับส่วนต่าง (บิลเดียวมีทั้งซื้อและขาย)
4. **ขายฝาก (จำนำทอง)** — ลูกค้าเอาทองมาวางรับเงิน มีดอกเบี้ย มีกำหนดไถ่ถอน ต่อดอกได้ ครบกำหนดไม่ไถ่ = หลุด (ทองเข้าสต๊อกร้าน)
5. **ออมทอง** — ลูกค้าผ่อนสะสมเงิน/น้ำหนักทอง ครบแล้วรับทองจริง
6. **สั่งทำ/สั่งผลิต** — งานช่าง มัดจำ นัดรับ
7. **ซ่อม/ชุบ/ขัด** — งานบริการ

### 2.4 ข้อกำหนดทางกฎหมายที่ระบบต้องรองรับ

- **AMLO (ปปง.)** — ร้านทองเป็น "ผู้ประกอบอาชีพตามมาตรา 16" ต้องทำ KYC/CDD ลูกค้า, รายงานธุรกรรมเงินสดเกินเกณฑ์ (แบบ ปปง. 1-05-9) และธุรกรรมมีเหตุอันควรสงสัย → ระบบต้องเก็บบัตรประชาชนลูกค้า, ตรวจ threshold อัตโนมัติ, export รายงาน
- **ภาษีมูลค่าเพิ่มร้านทอง** — ทองรูปพรรณเสีย VAT เฉพาะ "ค่ากำเหน็จ + ส่วนต่าง" (ฐานภาษีพิเศษตามประกาศกรมสรรพากร) ไม่ใช่ราคาเต็ม → เครื่องคิด VAT ต้องแยกฐานถูกต้อง และรองรับใบกำกับภาษีอย่างย่อ/เต็มรูป
- **ขายฝากตามประมวลกฎหมายแพ่งฯ + พ.ร.บ. ห้ามเรียกดอกเบี้ยเกินอัตรา** — ดอกเบี้ย/สินไถ่ต้องคำนวณตามกติกาและพิมพ์สัญญาถูกต้อง
- **PDPA** — เก็บข้อมูลส่วนบุคคล (บัตร ปชช., รูปถ่าย) ต้องมี consent, เข้ารหัส, สิทธิ์การเข้าถึง, retention policy

---

## 3. Feature ทั้งหมดแยกตามโมดูล (Full Feature List)

### โมดูล A — ราคาทอง (Gold Price Engine)

- [ ] ดึงราคาสมาคมค้าทองคำอัตโนมัติ (scheduled fetch) + fallback กรอกมือ
- [ ] เก็บประวัติราคาทุกประกาศ (timestamp, รอบประกาศ, buy/sell, แท่ง/รูปพรรณ)
- [ ] ประกาศราคาหน้าร้านเอง (ราคาร้านอาจต่างจากสมาคม) พร้อมผู้อนุมัติ
- [ ] Price board แสดงหน้าจอทีวีหน้าร้าน (route แยก, auto-refresh)
- [ ] Snapshot ราคาลงทุกบิล ณ เวลาทำรายการ
- [ ] กราฟราคาย้อนหลัง + แจ้งเตือนเมื่อราคาเปลี่ยนเกิน threshold

### โมดูล B — POS ซื้อ-ขายหน้าร้าน

- [ ] เปิดบิลขายทองใหม่: สแกนบาร์โค้ด/QR ที่ป้ายทอง → ดึงน้ำหนัก, ค่ากำเหน็จ, คำนวณราคาอัตโนมัติ
- [ ] รับซื้อทองเก่า: กรอกน้ำหนักชั่งจริง, % ทอง, เลือกเรต (ทองร้าน/ทองนอก), ถ่ายรูปสินค้า
- [ ] เปลี่ยนทอง (trade-in) ในบิลเดียว คำนวณส่วนต่างอัตโนมัติ
- [ ] ส่วนลด/ต่อรองราคา แบบมี limit ตาม role + ต้องใส่เหตุผล (ทุก override มี log)
- [ ] รับชำระหลายช่องทางในบิลเดียว: เงินสด, โอน (แนบสลิป/สแกน QR), บัตรเครดิต (+ ค่าธรรมเนียม)
- [ ] พิมพ์: ใบเสร็จ/ใบกำกับภาษีอย่างย่อ-เต็มรูป, ใบรับประกันสินค้า (มีเลขที่กำกับ)
- [ ] ระบบกะ (Shift): เปิดกะ-ปิดกะ, นับเงินสดในลิ้นชัก, กระทบยอดเงิน/ทองสิ้นวัน
- [ ] Void/คืนสินค้า ต้องมีผู้อนุมัติระดับผู้จัดการ + เหตุผล
- [ ] Hold บิล / เรียกบิลค้าง
- [ ] โหมดหน้าจอสัมผัส ใช้งานเร็ว keyboard-first สำหรับพนักงาน

### โมดูล C — ขายฝาก / จำนำ (Pawn Module)

- [ ] เปิดสัญญาขายฝาก: ถ่ายรูปทอง + ลูกค้า, ชั่งน้ำหนัก, ประเมินราคา (แนะนำวงเงินจาก % ของราคาตลาด), กำหนดดอกเบี้ย/ระยะเวลา
- [ ] พิมพ์สัญญาขายฝากตามแบบกฎหมาย + สำเนา
- [ ] ต่อดอก (interest renewal): คำนวณดอกเบี้ยค้าง, ออกใบเสร็จ, ขยายกำหนด
- [ ] ไถ่ถอน: คำนวณสินไถ่ (เงินต้น + ดอกเบี้ยตามจริง), คืนทอง, ปิดสัญญา
- [ ] เพิ่ม/ลดเงินต้น (ตีราคาใหม่)
- [ ] แจ้งเตือนสัญญาใกล้ครบกำหนด (in-app + export รายชื่อโทรตาม/SMS ภายหลัง)
- [ ] จัดการทองหลุดจำนำ: ครบกำหนด + ผ่อนผัน → อนุมัติหลุด → โอนเข้าสต๊อก (เป็นทองเก่า) พร้อมต้นทุน = เงินต้นค้าง
- [ ] ทะเบียนคุมทรัพย์ขายฝาก: ตำแหน่งเก็บ (ตู้เซฟ/ช่อง), สถานะ, ตรวจนับ
- [ ] Ledger ดอกเบี้ยรับ แยกตามสัญญา/งวด สำหรับบัญชี

### โมดูล D — ออมทอง (Gold Savings)

- [ ] เปิดสัญญาออม: แบบออมเงิน (สะสมยอดเงิน) หรือออมน้ำหนัก (ตัดน้ำหนักตามราคาวันฝาก)
- [ ] รับฝากรายงวด, บันทึกราคาทอง ณ วันฝาก, สมุดออม/statement
- [ ] ครบกำหนด: รับเป็นทองจริง (เลือกชิ้นจากสต๊อก) หรือขายคืนเป็นเงิน
- [ ] ผิดนัด/ยกเลิกกลางทาง: กติกาการคืนเงิน/ค่าธรรมเนียม configurable
- [ ] รายงาน liability รวม (ร้านติดหนี้ทอง/เงินลูกค้าเท่าไร) — สำคัญต่อการบริหารความเสี่ยง

### โมดูล E — สต๊อกและสินค้า (Inventory)

- [ ] ทะเบียนสินค้า: SKU, ประเภท (สร้อยคอ/แหวน/กำไล/ทองแท่ง...), ลาย, น้ำหนัก, % ทอง, ค่ากำเหน็จ, รูปถ่าย, ต้นทุน
- [ ] แยก "สินค้ารายชิ้น" (serialized — ทองรูปพรรณทุกชิ้นมีป้ายเลขไม่ซ้ำ) กับ "สินค้านับจำนวน" (ทองแท่งมาตรฐาน)
- [ ] พิมพ์ป้ายทอง barcode/QR (ขนาดป้ายจิวเวลรี่)
- [ ] รับเข้าจาก supplier (โรงงาน/ยี่ห้อ), บันทึกต้นทุน + น้ำหนักรับจริง
- [ ] ตัดสต๊อกอัตโนมัติเมื่อขาย, รับเข้าเมื่อรับซื้อ/ทองหลุด
- [ ] ทองเก่า → ส่งหลอม/ส่งคืนโรงงาน (melt lot): รวมน้ำหนัก, บันทึกยอดส่ง-รับ, ผลต่างเปอร์เซ็นต์
- [ ] โอนย้ายระหว่างสาขา/ตู้ (สองฝั่งยืนยัน — sender confirm + receiver confirm)
- [ ] ตรวจนับสต๊อก (stock count): สร้างรอบนับ, สแกนนับ, รายงานผลต่าง (ชิ้น + น้ำหนัก), ปรับปรุงแบบมีผู้อนุมัติ
- [ ] ตำแหน่งจัดเก็บ: ตู้โชว์/ถาด/เซฟ, การเบิกเข้า-ออกตู้เซฟมี log
- [ ] มูลค่าสต๊อกตามราคาตลาดปัจจุบัน (mark-to-market) เทียบต้นทุน

### โมดูล F — งานช่าง / สั่งผลิต / ซ่อม

- [ ] ใบสั่งทำ: สเปก, น้ำหนักโดยประมาณ, มัดจำ, วันนัดรับ, มอบหมายช่าง/โรงงาน
- [ ] เบิกทองให้ช่าง — คุมน้ำหนักเบิก vs น้ำหนักงานส่งคืน + เศษทอง (loss tolerance)
- [ ] ใบรับซ่อม: รับของ, ถ่ายรูปสภาพ, ค่าบริการ, สถานะงาน, แจ้งรับของ
- [ ] คิวงานช่าง + สถานะ (รับงาน → กำลังทำ → เสร็จ → ส่งมอบ)

### โมดูล G — ลูกค้าและ KYC (CRM + Compliance)

- [ ] ทะเบียนลูกค้า: ชื่อ, เลขบัตร ปชช. (เข้ารหัส), ที่อยู่, เบอร์, รูปถ่าย/รูปบัตร
- [ ] อ่านบัตรประชาชนผ่านเครื่องอ่าน smart card (integration point — mock ไว้ใน dev)
- [ ] ประวัติธุรกรรมทั้งหมดของลูกค้า (ซื้อ/ขาย/ขายฝาก/ออม)
- [ ] ระดับสมาชิก/แต้มสะสม/ส่วนลดประจำตัว (optional, configurable)
- [ ] **AMLO engine:** ตรวจ threshold ธุรกรรมเงินสด → flag + บังคับกรอก KYC เพิ่ม → สร้างรายงาน ปปง. (export)
- [ ] Blacklist / watchlist ภายในร้าน
- [ ] PDPA: consent record, data masking ตาม role, สิทธิ์ขอลบ/แก้ไข (soft-delete + anonymize)

### โมดูล H — บัญชีและการเงิน (Accounting & Finance)

- [ ] ผังบัญชี (Chart of Accounts) มาตรฐานร้านทอง + แก้ไขได้
- [ ] ลงบัญชีอัตโนมัติจากทุกธุรกรรม (double-entry journal ที่ระบบ generate)
- [ ] สมุดเงินสด/เงินฝากธนาคาร แยกบัญชี, กระทบยอด (reconciliation)
- [ ] ภาษีขาย-ภาษีซื้อ, รายงาน VAT ร้านทอง (ฐานค่ากำเหน็จ/ส่วนต่าง), ภ.พ.30 summary
- [ ] ใบกำกับภาษีเต็มรูป + running number ตามกฎ ไม่มีเลขข้าม/ซ้ำ
- [ ] งบทดลอง, งบกำไรขาดทุน (แยกกำไรจากส่วนต่างทอง / ค่ากำเหน็จ / ดอกเบี้ยขายฝาก), งบแสดงฐานะการเงินเบื้องต้น
- [ ] ค่าใช้จ่ายร้าน (expense) + หมวดหมู่ + แนบเอกสาร
- [ ] ปิดงวดบัญชี (period locking) — งวดที่ปิดแล้วห้ามแก้ธุรกรรมย้อนหลัง

### โมดูล I — รายงานและ Dashboard

- [ ] Dashboard ผู้บริหาร: ยอดขาย/ซื้อวันนี้, กำไรขั้นต้น, เงินสดคงเหลือ, มูลค่าสต๊อก, ยอดขายฝากคงค้าง, exposure สุทธิ (ทอง long/short)
- [ ] รายงานประจำวัน: สรุปปิดกะ, เงินสด/โอน/บัตร, น้ำหนักทองเข้า-ออก
- [ ] รายงานสต๊อก: คงเหลือตามหมวด/สาขา, สินค้าค้างนาน (aging), เคลื่อนไหว
- [ ] รายงานขายฝาก: portfolio, ดอกเบี้ยรับ, อัตราหลุด, ครบกำหนดล่วงหน้า 7/15/30 วัน
- [ ] รายงานภาษี/AMLO export (CSV/PDF)
- [ ] Export ทุกรายงานเป็น CSV/Excel/PDF

### โมดูล J — ระบบหลายสาขาและองค์กร

- [ ] Multi-branch: ข้อมูลแยกสาขา + รวมศูนย์, ราคากลางประกาศจากสำนักงานใหญ่
- [ ] โอนเงิน/โอนทองระหว่างสาขา (in-transit state)
- [ ] สิทธิ์ผู้ใช้ผูกกับสาขา

### โมดูล K — พนักงาน

- [ ] ทะเบียนพนักงาน, ผูก user account, กะการทำงาน
- [ ] ค่าคอมมิชชั่นการขาย (rule configurable) + รายงาน
- [ ] PIN/รหัสอนุมัติสำหรับ action พิเศษ (แยกจากรหัส login)

### โมดูล L — ระบบหลังบ้านและความปลอดภัย (Admin, Security, Platform)

- [ ] Authentication: username/password (Argon2id), บังคับรหัสผ่านแข็งแรง, 2FA (TOTP) สำหรับ role สูง
- [ ] RBAC ละเอียดระดับ permission (ไม่ใช่แค่ role) + branch scoping
- [ ] Session management: idle timeout, บังคับ re-auth ก่อน action สำคัญ (step-up auth)
- [ ] Audit log ทุก mutation: ใคร-ทำอะไร-เมื่อไร-ค่าเก่า/ใหม่-จาก IP/เครื่องไหน (append-only)
- [ ] การตั้งค่าระบบ: เรตรับซื้อ, ค่ากำเหน็จ default, ดอกเบี้ยขายฝาก, threshold ต่าง ๆ, เลขที่เอกสาร
- [ ] Backup/Restore ฐานข้อมูลจากหน้า admin (local: pg_dump scheduled) + ทดสอบ restore
- [ ] Health check page (DB, Redis, price feed, printer service)
- [ ] Notification center ภายในระบบ (สัญญาครบกำหนด, สต๊อกผิดปกติ, ราคาเปลี่ยนแรง)

---

## 4. สถาปัตยกรรมและ Tech Stack

### 4.1 Stack ที่แนะนำ (ทั้งหมดรันบน Local ผ่าน Docker Compose)

| Layer                 | เทคโนโลยี                                                                                                         | เหตุผล                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Frontend + BFF        | **Next.js 15 (App Router) + TypeScript (strict)**                                                                 | ตามโจทย์, ทำ SSR/Server Actions/Route Handlers ได้ในตัว                |
| UI                    | Tailwind CSS + shadcn/ui + TanStack Table + React Hook Form + Zod                                                 | ฟอร์มเยอะ ตารางเยอะ ต้องการ validation แน่นทั้ง client/server          |
| State/Data fetching   | TanStack Query + Server Components                                                                                | cache + optimistic update สำหรับ POS                                   |
| Database              | **PostgreSQL 16**                                                                                                 | ACID จริงจัง, `NUMERIC` สำหรับเงิน/น้ำหนัก, row-level lock สำหรับสต๊อก |
| ORM                   | **Prisma** (หรือ Drizzle) + migration แบบ versioned                                                               | schema เป็น source of truth, review migration ได้                      |
| Cache/Queue           | **Redis** (BullMQ)                                                                                                | ราคาทอง cache, job ดึงราคา, งาน export หนัก ๆ                          |
| Auth                  | **Auth.js (NextAuth v5)** credentials + TOTP (otplib)                                                             | ควบคุม session server-side ได้                                         |
| Validation            | **Zod schema ใช้ร่วมกัน client/server**                                                                           | single source of truth ของ business rule input                         |
| PDF/พิมพ์             | react-pdf หรือ Playwright print-to-PDF สำหรับใบกำกับ/สัญญา; ESC/POS ผ่าน local print service (Node) สำหรับใบเสร็จ | รองรับทั้งเอกสาร A4 และ slip 80mm                                      |
| Testing               | Vitest (unit), Playwright (E2E), Testcontainers (integration กับ Postgres จริง)                                   | business logic เงิน-ทองต้อง test หนัก                                  |
| Observability (local) | pino (structured log) + OpenTelemetry local + Grafana/Loki (optional)                                             | debug ธุรกรรมย้อนหลังได้                                               |
| Dev environment       | Docker Compose: `web`, `postgres`, `redis`, `mailhog`(mock email), `print-service`                                | ทุกคนในทีม env เดียวกัน                                                |

### 4.2 Architecture Diagram (ระดับ Concept)

```
[Browser: POS / Back office / Price Board TV]
        │ HTTPS (mkcert แม้ใน local)
        ▼
[Next.js App]
 ├── App Router (RSC) — หน้า UI
 ├── Server Actions / Route Handlers — API ภายใน (ทุกอันผ่าน auth + zod + permission check)
 ├── Service Layer (pure TypeScript) — business logic: pricing, pawn interest, VAT, stock
 ├── Repository Layer (Prisma) — DB access ภายใน transaction เท่านั้น
 ▼
[PostgreSQL]  [Redis + BullMQ workers]  [Local Print Service]
                   │
                   └── Job: ดึงราคาทองสมาคม, สร้าง PDF, ส่ง notification, backup
```

**กติกาสถาปัตยกรรมที่ต้องถือเคร่งครัด:**

1. Business logic อยู่ใน service layer ที่เป็น pure function ให้มากที่สุด (คำนวณราคา, ดอกเบี้ย, VAT) → unit test ได้ 100%
2. ทุก use case ที่แตะเงิน/ทอง ห่อใน **DB transaction เดียว** + ใช้ `SELECT ... FOR UPDATE` กับแถวสต๊อก/เลขที่เอกสาร
3. ทุก API endpoint: authenticate → authorize (permission + branch) → validate (zod) → execute → audit log — ไม่มีข้อยกเว้น
4. เลขที่เอกสาร (บิล/ใบกำกับ/สัญญา) ออกจากตาราง sequence ภายใน transaction — ห้าม gap ในเลขใบกำกับภาษี
5. ห้าม logic เงินอยู่ฝั่ง client — client แค่แสดงผล ค่าที่ผูกพันจริงคำนวณที่ server เสมอ

### 4.3 โครงสร้างข้อมูลสำคัญ (Core Data Model — ~35 ตารางหลัก)

**Master:** `branches`, `users`, `roles`, `permissions`, `user_branch_roles`, `settings`, `customers`, `customer_documents`, `suppliers`, `employees`, `product_categories`, `products` (แบบชิ้น serialized + แบบนับจำนวน), `product_labels`, `storage_locations`

**ราคา:** `gold_price_feeds` (จากสมาคม), `shop_price_announcements` (ราคาร้าน + ผู้อนุมัติ)

**ธุรกรรม:** `sales_orders` + `sales_order_items` + `payments` (polymorphic ผูกได้ทุกเอกสาร), `purchase_orders` (รับซื้อทองเก่า/รับจาก supplier), `trade_ins`, `pawn_contracts` + `pawn_interest_payments` + `pawn_events` (ต่อดอก/ไถ่/หลุด เป็น event log), `saving_accounts` + `saving_deposits`, `work_orders` (สั่งทำ/ซ่อม), `melt_lots`

**สต๊อก:** `inventory_items` (สถานะ: in_stock / sold / pawned_collateral / in_transit / melted / missing), `stock_movements` (append-only ledger ของทุกการเคลื่อนไหว), `stock_counts` + `stock_count_items`, `branch_transfers`

**บัญชี:** `chart_of_accounts`, `journal_entries` + `journal_lines` (double-entry), `tax_invoices`, `cash_drawers` + `shifts` + `shift_reconciliations`, `expenses`, `accounting_periods`

**ระบบ:** `audit_logs` (append-only), `document_sequences`, `notifications`, `jobs_log`, `amlo_reports`

**ชนิดข้อมูลบังคับ:**

- เงิน: `BIGINT` หน่วยสตางค์ หรือ `NUMERIC(14,2)` — เลือกอย่างเดียวทั้งระบบ (แนะนำ BIGINT สตางค์)
- น้ำหนัก: `NUMERIC(10,3)` หน่วยกรัม (+ field หน่วยแสดงผล)
- ทุกตารางธุรกรรม: `created_by`, `created_at`, `branch_id`, `price_snapshot` (JSONB ราคาทอง ณ ขณะนั้น)
- Soft delete เฉพาะ master data; ตารางธุรกรรมใช้ status + reversal เท่านั้น

---

## 5. มาตรการ Security (รายละเอียด)

### 5.1 Authentication & Session

- [ ] Argon2id hash รหัสผ่าน (memory ≥ 64MB, iterations ตาม OWASP)
- [ ] นโยบายรหัสผ่าน: ≥ 12 ตัว, ตรวจกับ common-password list, บังคับเปลี่ยนเมื่อถูก reset
- [ ] Rate limiting + lockout ชั่วคราวเมื่อ login ผิดซ้ำ (per user + per IP)
- [ ] 2FA TOTP บังคับสำหรับ Owner/Manager/Accountant/Admin
- [ ] Session: httpOnly + Secure + SameSite=Lax cookie, absolute timeout 12 ชม., idle timeout 30 นาที (POS ปรับได้), revoke ได้จากหน้า admin
- [ ] Step-up authorization: void บิล, แก้ราคาเกิน limit, อนุมัติทองหลุด, ปรับสต๊อก → ต้องใส่ PIN ผู้อนุมัติ (คนละคนกับผู้ทำรายการได้ = maker-checker)

### 5.2 Authorization

- [ ] Permission-based (เช่น `sale.create`, `sale.void`, `price.override`, `stock.adjust`, `report.finance.view`) map เข้า role
- [ ] Branch scoping ทุก query — enforce ที่ repository layer ไม่ใช่แค่ UI
- [ ] Deny-by-default: endpoint ที่ไม่ประกาศ permission = ปฏิเสธ
- [ ] ทดสอบ authorization matrix อัตโนมัติ (ทุก role × ทุก endpoint สำคัญ)

### 5.3 Data Protection

- [ ] เข้ารหัส field อ่อนไหว (เลขบัตร ปชช., เลขบัญชี) ด้วย AES-256-GCM, key แยกจาก DB (env/KMS-ready), เก็บ hash (HMAC) ไว้ค้นหา
- [ ] Masking ตาม role (พนักงานขายเห็นเลขบัตรบางส่วน x-xxxx-xxxx1-23-x)
- [ ] รูปบัตร/รูปลูกค้า เก็บนอก web root, เสิร์ฟผ่าน authorized route เท่านั้น + signed URL อายุสั้น
- [ ] TLS แม้ใน local dev (mkcert) เพื่อให้พฤติกรรม cookie/secure ตรงกับ production ในอนาคต
- [ ] Log ห้ามมี PII/secret (pino redact paths)

### 5.4 Application Security

- [ ] Zod validate ทุก input ฝั่ง server (ค่าเงิน/น้ำหนักต้องเป็นบวก, ทศนิยมตามสเปก, enum เข้ม)
- [ ] ป้องกัน SQL injection ด้วย ORM/parameterized เท่านั้น — ห้าม raw string interpolation
- [ ] CSRF protection (Server Actions ของ Next มี origin check — เพิ่ม explicit check สำหรับ route handlers)
- [ ] Security headers: CSP (nonce-based), X-Frame-Options, Referrer-Policy, HSTS
- [ ] Idempotency-Key สำหรับการยิงสร้างบิล/ชำระเงิน (กันดับเบิลคลิก/รีทราย)
- [ ] Dependency scanning: `pnpm audit` + Renovate/Dependabot config, lockfile บังคับ
- [ ] Secrets ผ่าน `.env` + zod-validated config, มี `.env.example`, ห้าม commit secret (gitleaks pre-commit)

### 5.5 Audit & Anti-fraud (สำคัญมากสำหรับร้านทอง)

- [ ] Audit log append-only (DB user ของแอปไม่มีสิทธิ์ UPDATE/DELETE ตารางนี้ — ใช้ trigger/permission ระดับ Postgres)
- [ ] เก็บ before/after ของทุก mutation สำคัญ + request id เชื่อมถึง log
- [ ] รายงานพฤติกรรมเสี่ยง: void ถี่, override ราคาถี่, ขายต่ำกว่าทุน, ปรับสต๊อกบ่อย → dashboard สำหรับ owner
- [ ] แยกอำนาจ (segregation of duties): คนขายห้ามอนุมัติ void ตัวเอง, คนนับสต๊อกห้ามอนุมัติผลต่างเอง

---

## 6. มาตรการ Reliability (รายละเอียด)

### 6.1 ความถูกต้องของธุรกรรม

- [ ] ทุก use case เงิน/ทอง = single DB transaction, isolation ระดับเหมาะสม (default READ COMMITTED + row lock จุดชนกัน)
- [ ] Stock movement เป็น ledger append-only แล้ว derive ยอดคงเหลือ — ยอดคงเหลือตรวจสอบย้อนกลับได้เสมอ
- [ ] Constraint ระดับ DB: CHECK (น้ำหนัก > 0), UNIQUE (เลขที่เอกสาร), FK ครบ, partial index กันขายชิ้นเดิมซ้ำ (inventory_item ขายได้ครั้งเดียว)
- [ ] Invariant checks รายวัน (job): Σ journal debit = credit, ยอดสต๊อกจาก ledger = สถานะรายชิ้น, เลขใบกำกับไม่ข้าม
- [ ] Idempotent job + retry with backoff สำหรับงาน background ทุกตัว

### 6.2 ความพร้อมใช้งาน (ในบริบท local)

- [ ] ราคาทอง feed ล่ม → ใช้ราคาล่าสุด + banner เตือน + ให้ผู้จัดการประกาศราคามือ
- [ ] Printer service ล่ม → บิลยัง commit ได้, เข้าคิวพิมพ์ใหม่/พิมพ์ซ้ำจากประวัติ
- [ ] Graceful degradation: report หนัก ๆ ทำผ่าน queue ไม่บล็อกหน้า POS
- [ ] Health endpoint + หน้า status ภายใน

### 6.3 ข้อมูลไม่หาย

- [ ] pg_dump อัตโนมัติทุกคืน + ก่อน migration ทุกครั้ง, เก็บ N ชุด, ตรวจ checksum
- [ ] ซ้อม restore ลง DB ว่างเป็นส่วนหนึ่งของ Definition of Done แต่ละ phase
- [ ] Migration ทุกตัวมี down path หรือแผน rollback เขียนไว้
- [ ] WAL archiving เปิดไว้ตั้งแต่ dev เพื่อฝึก point-in-time recovery

---

## 7. แผนการพัฒนาแบ่งเป็น Phase พร้อม Checklist ละเอียด

> ประมาณการโดยสมมติทีม 2–3 คน (full-stack) ระยะเวลารวม ~6–8 เดือนถึงจบ Phase 8
> ทุก Phase มี **Definition of Done ร่วม:** unit test ผ่าน ≥ 80% coverage ใน service layer, E2E happy path ผ่าน, ไม่มี critical จาก `pnpm audit`, migration ทดสอบ up/down แล้ว, อัปเดตเอกสาร

### Phase 0 — Foundation & Project Setup (สัปดาห์ 1–2)

- [x] ตั้ง repo (git init แล้ว — branch strategy trunk-based + commit convention ตกลงกันตอนเริ่มมีทีม)
- [x] สร้าง Next.js 15 + TypeScript strict + ESLint + Prettier + Husky (lint-staged, gitleaks ใน hook/CI — binary local ติดตั้งเพิ่มได้: `winget install Gitleaks.Gitleaks`)
- [x] Docker Compose: postgres, redis, mailhog (TLS dev ใช้ `pnpm dev:https` แทน mkcert ไปก่อน)
- [x] Prisma init (v7) + migration pipeline + seed script framework
- [x] โครง Service/Repository layer + ตัวอย่าง 1 use case จบ loop (document sequence no-gap + concurrency test)
- [x] ตั้ง Vitest + Testcontainers + Playwright โครงพร้อมรัน
- [x] Config module (zod-validated env), pino logger + request id middleware
- [x] เอกสาร: ADR-001 stack, ADR-002 กติกาเก็บเงิน/น้ำหนัก, README วิธี setup ใน 1 คำสั่ง (`docker compose up` + `pnpm dev`)
- [x] CI GitHub Actions: lint → typecheck → unit → integration → e2e (บน PR) + gitleaks + pnpm audit

### Phase 1 — Auth, RBAC, Audit, Settings (สัปดาห์ 3–5)

- [x] Schema: users, roles, permissions, branches, user_branch_roles, audit_logs, settings, document_sequences (+ sessions, recovery_codes; audit_logs append-only ด้วย Postgres trigger)
- [x] Login (Argon2id) + lockout + rate limit (per-IP + per-username, Redis fixed-window; lockout 5 ครั้ง/15 นาที; timing-safe dummy verify)
- [x] TOTP 2FA (enroll, verify, recovery codes) — otplib v13, secret เข้ารหัส AES-256-GCM, recovery 10 ชุดใช้ครั้งเดียว
- [x] Session management + idle/absolute timeout + revoke (DB-backed session เขียนเอง — เหตุผลใน ADR-003; integration test ครบ 7 path)
- [x] Permission middleware (deny-by-default) + branch scoping ใน repository — `requirePermission()` + catalog ใน `src/server/auth/permissions.ts`
- [x] Step-up PIN อนุมัติ (maker-checker primitive ให้โมดูลอื่นเรียกใช้) — `requireApproval()` รองรับ requireDifferentApprover
- [x] Audit log service (append-only บังคับด้วย Postgres trigger กัน UPDATE/DELETE/TRUNCATE) — `writeAuditLog()` helper เดียว
- [x] หน้า Admin: จัดการผู้ใช้/บทบาท/สาขา/ตั้งค่า + audit viewer + โปรไฟล์ (เปลี่ยนรหัส/เปิด-ปิด 2FA) — หน้า role ยัง read-only (แก้สิทธิ์รายบทบาท = backlog Phase ถัดไป)
- [x] Document sequence service (transactional, no-gap สำหรับใบกำกับ) — ทำแล้วตั้งแต่ Phase 0 พร้อม concurrency test 100 requests
- [x] **Test สำคัญ:** authorization matrix test (ทุก role × ทุก permission), concurrency test เลขที่เอกสาร (ยิงพร้อมกัน 100 requests ห้ามซ้ำ/ข้าม)

### Phase 2 — Gold Price Engine (สัปดาห์ 6–7)

- [x] Schema: gold_price_feeds, shop_price_announcements (+ snapshot format มาตรฐาน) — ราคา BIGINT สตางค์/บาททอง, dedupe ด้วย unique(source, announcedAt)
- [x] Job ดึงราคาสมาคม (BullMQ, retry/backoff) + mock feed สำหรับ dev/test — worker แยก process (`pnpm worker`), adapter จริงของสมาคมเสียบเพิ่มได้ผ่าน `GoldPriceFeedSource`
- [x] หน้าอนุมัติ/ประกาศราคาร้าน + ประวัติ — /admin/prices (permission price.announce, prefill จาก feed ล่าสุด, กรอกราคามือเมื่อ feed ล่ม)
- [x] Price snapshot service — ทุกโมดูลธุรกรรมต้องเรียกผ่านตัวนี้เท่านั้น (`buildPriceSnapshot()` format v1 มี zod schema กำกับ, bigint เก็บเป็น string ใน JSONB)
- [x] Price board page (route สาธารณะภายในร้าน, auto refresh 15 วิ, read-only token ผ่าน setting `price_board.token`)
- [x] กราฟราคาย้อนหลัง + alert ราคาเปลี่ยนเกิน threshold (banner ในหน้า admin + log จาก worker; แจ้งเตือนเข้า notification center = รอโมดูล L)
- [x] **Test:** feed ล่ม → ระบบยังขายได้ด้วยราคาประกาศล่าสุด + เตือน (feedStale flag, threshold ปรับผ่าน settings)

### Phase 3 — Inventory (สัปดาห์ 8–11)

- [x] Schema: categories, products, inventory_items, stock_movements (ledger), storage_locations, labels (+ suppliers, branch_transfers, melt_lots, stock_counts — ledger append-only ด้วย trigger, CHECK น้ำหนัก/ต้นทุน/เครื่องหมาย quantity ระดับ DB)
- [x] รับสินค้าเข้า (จาก supplier) + ต้นทุน + พิมพ์ป้าย barcode/QR
- [x] Serialized item lifecycle: in_stock → sold/pawned/melted/in_transit/missing (state machine + partial unique index)
- [x] ค้นหา/สแกนสินค้า (keyboard-first, debounce, ล็อกชิ้นเมื่อถูกดึงเข้าบิล)
- [x] โอนย้ายระหว่างตู้/สาขา แบบ 2-step confirm
- [x] ตรวจนับสต๊อก: สร้างรอบ, สแกน, ผลต่าง, อนุมัติปรับปรุง (step-up PIN)
- [x] Melt lot (ส่งหลอม/คืนโรงงาน)
- [x] Mark-to-market valuation report
- [x] **Test:** concurrency ขายชิ้นเดียวกันพร้อมกัน 2 เครื่อง → สำเร็จเครื่องเดียว; ledger replay ต้องได้ยอดตรงกับสถานะรายชิ้นเสมอ

### Phase 4 — POS ซื้อ-ขาย + ชำระเงิน + ภาษี (สัปดาห์ 12–16) ★ หัวใจระบบ

- [x] Schema: sales_orders/items, purchase_orders/items, trade_ins, payments, tax_invoices, shifts, cash_drawers
- [x] Pricing service: ขายรูปพรรณ/แท่ง, รับซื้อ (ทองร้าน/ทองนอก), ค่ากำเหน็จ rule engine — pure functions + test ครอบทุกสูตร
- [x] VAT ร้านทอง (ฐานส่วนต่าง/ค่ากำเหน็จ) + ใบกำกับอย่างย่อ/เต็มรูป + running number
- [x] หน้า POS ขาย: สแกน → ตะกร้า → ส่วนลด (limit ตาม role) → ชำระหลายช่องทาง → พิมพ์
- [x] หน้ารับซื้อทองเก่า: ชั่งน้ำหนัก, เลือกเรต, ถ่ายรูป, จ่ายเงิน (เชื่อม AMLO check เบื้องต้น)
- [x] Trade-in บิลผสมซื้อ+ขาย คำนวณส่วนต่าง
- [x] Idempotency key ที่จุด submit บิล/ชำระเงิน
- [x] Void/คืนสินค้า (reversal document + คืนสต๊อก + กลับรายการบัญชี) พร้อมอนุมัติ
- [x] Shift: เปิด/ปิดกะ, นับเงิน, กระทบยอดเงิน+น้ำหนักทอง, รายงานปิดวัน
- [x] Print service: slip 80mm (ESC/POS) + ใบกำกับ/ใบรับประกัน PDF + retry queue
- [x] **Test:** golden test สูตรราคา/ภาษีเทียบกับเคสจริงที่คำนวณมือ, E2E ขาย-รับซื้อ-เปลี่ยน-void ครบ loop, ปิดกะยอดต้อง reconcile ลงตัว

### Phase 5 — ขายฝาก (Pawn) (สัปดาห์ 17–20) ★ ตัวสร้างรายได้หลักของหลายร้าน

- [ ] Schema: pawn_contracts, pawn_events, pawn_interest_payments, collateral location tracking
- [ ] Interest engine: ดอกเบี้ยรายเดือน/เศษวัน, เพดานตามกฎหมาย, สูตร configurable — pure function + ตารางเทสต์เคสละเอียด
- [ ] เปิดสัญญา: ประเมินวงเงิน (% ของ market), ถ่ายรูปทรัพย์+ลูกค้า, พิมพ์สัญญา 2 ฉบับ
- [ ] ต่อดอก / ไถ่ถอน / เพิ่ม-ลดเงินต้น (ทุก event append ลง pawn_events)
- [ ] ทองหลุด: ผ่อนผัน → อนุมัติ (step-up) → โอนเข้าสต๊อกพร้อมต้นทุน
- [ ] แจ้งเตือนครบกำหนด + รายการโทรตาม + export
- [ ] ทะเบียนคุมทรัพย์ + ตรวจนับทรัพย์ขายฝาก
- [ ] **Test:** คำนวณดอกเบี้ยทุก edge case (ต่อดอกกลางงวด, ไถ่ก่อนกำหนด, ข้ามปี), สถานะสัญญาเป็น state machine ที่ transition ผิดไม่ได้

### Phase 6 — ออมทอง + งานช่าง + CRM/AMLO (สัปดาห์ 21–24)

- [ ] ออมทอง: เปิดบัญชี (ออมเงิน/ออมน้ำหนัก), ฝากรายงวด, statement, ปิดรับทอง/รับเงิน, liability report
- [ ] Work orders: สั่งทำ (มัดจำ, เบิกทองช่าง, tolerance เศษทอง), ซ่อม (รับของ-คืนของ, ค่าบริการ), คิวงาน
- [ ] CRM: โปรไฟล์ลูกค้า, ประวัติทุกธุรกรรม, แต้ม/ระดับ (configurable), mock smart card reader
- [ ] AMLO engine: threshold rules, บังคับ KYC, สร้าง/export รายงาน, ทะเบียน watchlist
- [ ] PDPA: consent, masking ตาม role, anonymize workflow
- [ ] **Test:** ออมทองปิดบัญชีทุกกรณี (ครบ/ยกเลิก/ผิดนัด), AMLO trigger ตาม threshold ถูกต้อง

### Phase 7 — บัญชี การเงิน รายงาน Dashboard (สัปดาห์ 25–28)

- [ ] Chart of accounts + posting rules: ทุกธุรกรรมจาก Phase 4–6 ลง journal อัตโนมัติ (backfill จากข้อมูลที่มี)
- [ ] สมุดเงินสด/ธนาคาร + reconciliation
- [ ] รายงาน VAT (ภ.พ.30 summary), ภาษีซื้อ-ขาย
- [ ] งบทดลอง, P&L (แยกกำไรทอง/กำเหน็จ/ดอกเบี้ย), ฐานะการเงินเบื้องต้น
- [ ] ปิดงวดบัญชี (period lock) — ธุรกรรมย้อนหลังในงวดปิดถูกปฏิเสธทั้งระบบ
- [ ] ค่าใช้จ่าย + ค่าคอมมิชชั่นพนักงาน
- [ ] Dashboard ผู้บริหาร + รายงานทั้งหมด (โมดูล I) + export CSV/Excel/PDF ผ่าน queue
- [ ] **Test:** invariant Σdebit=Σcredit ทุกวัน, ธุรกรรมทุกชนิดมี posting rule ครบ (test enumerate), period lock กันได้จริง

### Phase 8 — Hardening, Multi-branch สมบูรณ์, UAT (สัปดาห์ 29–32)

- [ ] โอนเงิน/ทองข้ามสาขา end-to-end + รายงานรวมศูนย์
- [ ] Fraud dashboard (void/override/adjust ผิดปกติ)
- [ ] Backup อัตโนมัติ + ซ้อม restore + เอกสาร runbook
- [ ] Security pass: ทบทวน authorization matrix, CSP, dependency audit, ทดลอง threat scenario หลัก (พนักงานทุจริต, ยิง API ตรง, session hijack ใน LAN)
- [ ] Load test หน้า POS (จำลอง 10 เครื่องพร้อมกัน) + ปรับ index/query
- [ ] Seed ข้อมูลสาธิตสมจริง + คู่มือผู้ใช้ต่อ role + วิดีโอ/เอกสาร training
- [ ] UAT script ตามธุรกรรมจริง 1 วันเต็ม (เปิดกะ→ขาย→รับซื้อ→ขายฝาก→ต่อดอก→ปิดกะ→ปิดวัน→รายงาน)
- [ ] เก็บ tech debt + จัดทำ backlog สำหรับเฟส deployment ในอนาคต (แค่เอกสาร ไม่ลงมือ)

---

## 8. Checklist คุณภาพขวางทุก Phase (Cross-cutting)

### Security Gate (ตรวจทุก PR ที่แตะธุรกรรม)

- [ ] มี permission check และ branch scope
- [ ] Input ผ่าน zod ฝั่ง server
- [ ] เขียน audit log พร้อม before/after
- [ ] ไม่มีค่าเงิน/น้ำหนักคำนวณฝั่ง client แล้วเชื่อโดยตรง
- [ ] ไม่มี secret/PII หลุดลง log

### Reliability Gate

- [ ] ธุรกรรมอยู่ใน DB transaction เดียว + จุดชนกันมี lock
- [ ] จุด submit สำคัญมี idempotency
- [ ] มี test concurrency ถ้าแตะสต๊อก/เลขเอกสาร
- [ ] Failure path เขียนไว้ (printer ล่ม, feed ล่ม, job fail → retry)

### Testing Pyramid เป้าหมาย

- Unit (service/pure logic): ครอบสูตรเงิน/ดอกเบี้ย/ภาษี 100%
- Integration (Testcontainers): repository + transaction + constraint
- E2E (Playwright): flow หลักต่อโมดูลอย่างน้อยโมดูลละ 3 scenario
- Manual UAT: ตาม script Phase 8

---

## 9. ความเสี่ยงหลักและแผนรับมือ

| ความเสี่ยง                                             | ผลกระทบ | แผนรับมือ                                                            |
| ------------------------------------------------------ | ------- | -------------------------------------------------------------------- |
| สูตรภาษี/ดอกเบี้ยผิดจากกฎหมายจริง                      | สูงมาก  | ให้บัญชี/ที่ปรึกษาร้านทองรีวิว golden test cases ก่อนเริ่ม Phase 4–5 |
| ราคาทองผันผวนระหว่างทำบิล                              | สูง     | Snapshot + บิลมีอายุ (เช่น lock ราคา 5 นาที) + re-confirm ถ้าเกิน    |
| พนักงานทุจริต                                          | สูง     | Maker-checker, audit log, fraud dashboard, segregation of duties     |
| Scope ใหญ่เกิน ทำไม่จบ                                 | กลาง    | ตัดจบเป็น phase, Phase 4 (POS) ใช้งานจริงได้ก่อนโดยไม่รอโมดูลอื่น    |
| ข้อมูลสต๊อกเพี้ยนจาก bug concurrency                   | สูง     | Ledger append-only + invariant job รายวัน + concurrency tests        |
| Hardware integration (printer/เครื่องอ่านบัตร) ติดหล่ม | กลาง    | Mock ทุก integration ใน dev, ออกแบบเป็น adapter เปลี่ยนได้           |

---

## 10. สิ่งที่ควรเตรียมก่อนเริ่ม (Pre-project Checklist)

- [ ] สัมภาษณ์เจ้าของร้าน/พนักงานจริง เก็บสูตรราคา, เรตรับซื้อ, กติกาขายฝากของร้าน (แต่ละร้านไม่เหมือนกัน)
- [ ] เก็บตัวอย่างเอกสารจริง: บิล, ใบกำกับภาษี, สัญญาขายฝาก, ใบรับประกัน, สมุดออมทอง → ใช้ออกแบบ template
- [ ] ยืนยันเกณฑ์ AMLO และรูปแบบรายงานล่าสุดกับที่ปรึกษา/เว็บ ปปง.
- [ ] ยืนยันแนวปฏิบัติ VAT ร้านทองล่าสุดกับสำนักงานบัญชีของร้าน
- [ ] สำรวจ hardware ที่ร้านใช้: เครื่องพิมพ์ slip, เครื่องพิมพ์ป้ายทอง, เครื่องชั่ง (มี interface ไหม), เครื่องอ่านบัตร ปชช.
- [ ] ตกลง Definition of Done และ cadence รีวิวงานกับผู้มีส่วนได้เสีย

---

_เอกสารนี้เป็น living document — อัปเดต checklist และ ADR ทุกครั้งที่ตัดสินใจสำคัญ_
