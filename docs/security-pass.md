# รายงานการทบทวนความปลอดภัย (Security Pass)

ระบบ Gold Shop ERP ได้รับการประเมินความปลอดภัยตามเช็คลิสต์ Phase 8 ดังนี้:

---

## 1. content Security Policy (CSP)

ติดตั้ง CSP ผ่าน Next.js Middleware (`src/middleware.ts`) เพื่อจำกัดแหล่งที่มาของสคริปต์, รูปภาพ, สไตล์, และฟอนต์ โดยมีกฎดังนี้:

- `default-src 'self'`: อนุญาตให้โหลด Resource จาก Domain เดียวกันเท่านั้น
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'`: อนุญาตให้รันสคริปต์ของ Next.js และ inline script ที่จำเป็นสำหรับการจัดการสถานะ
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: รองรับสไตล์ชีตและฟอนต์ภายนอกจาก Google Fonts
- `img-src 'self' blob: data:`: รองรับรูปภาพสินค้าและการแปลง Canvas/QR code
- `font-src 'self' data: https://fonts.gstatic.com`: รองรับฟอนต์จาก Google Fonts gstatic
- `object-src 'none'`: บล็อกการโหลด Flash/Plugins
- `frame-ancestors 'none'`: ป้องกันการโจมตีประเภท Clickjacking

---

## 2. ตารางสิทธิ์เข้าใช้งานระบบ (Authorization Matrix)

ระบบออกแบบมาตามหลัก **Least Privilege** และ **Deny-by-Default** การแจกแจงสิทธิ์หลักแบ่งตามบทบาทดังนี้:

| Module / Permission              | OWNER | ADMIN | BRANCH_MANAGER | CASHIER | STOCK_KEEPER |   ACCOUNTANT   |
| :------------------------------- | :---: | :---: | :------------: | :-----: | :----------: | :------------: |
| **Admin & Users Management**     |       |       |                |         |              |                |
| `user.manage` / `user.view`      |   ✓   |   ✓   | ✓ (เฉพาะ view) |         |              |                |
| `role.manage`                    |   ✓   |   ✓   |                |         |              |                |
| `branch.manage`                  |   ✓   |   ✓   |                |         |              |                |
| `settings.manage` / `view`       |   ✓   |   ✓   | ✓ (เฉพาะ view) |         |              |                |
| `audit.view`                     |   ✓   |       |                |         |              |       ✓        |
| **Gold Price Engine**            |       |       |                |         |              |                |
| `price.view`                     |   ✓   |       |       ✓        |    ✓    |      ✓       |       ✓        |
| `price.announce`                 |   ✓   |       |                |         |              |                |
| **Inventory & Stock**            |       |       |                |         |              |                |
| `stock.view`                     |   ✓   |       |       ✓        |    ✓    |      ✓       |                |
| `stock.receive` / `melt`         |   ✓   |       |       ✓        |         |      ✓       |                |
| `stock.transfer`                 |   ✓   |       |       ✓        |         |      ✓       |                |
| `stock.count`                    |   ✓   |       |       ✓        |    ✓    |      ✓       |                |
| `stock.adjust` (PIN required)    |   ✓   |       |       ✓        |         |              |                |
| `cash.transfer` (PIN required)   |   ✓   |       |       ✓        |         |              |                |
| **Pawn (ขายฝาก)**                |       |       |                |         |              |                |
| `pawn.view`                      |   ✓   |       |       ✓        |    ✓    |      ✓       |       ✓        |
| `pawn.open` / `renew` / `redeem` |   ✓   |       |       ✓        |    ✓    |              |                |
| `pawn.adjust_principal`          |   ✓   |       |       ✓        |         |              |                |
| `pawn.forfeit` / `cancel`        |   ✓   |       |       ✓        |         |              |                |
| **CRM & PDPA**                   |       |       |                |         |              |                |
| `customer.view` / `manage`       |   ✓   |       |       ✓        |    ✓    |              | ✓ (เฉพาะ view) |
| `customer.view_pii` (No mask)    |   ✓   |       |       ✓        |         |              |                |
| `customer.anonymize` (PIN)       |   ✓   |       |       ✓        |         |              |                |
| **Gold Savings & Work Orders**   |       |       |                |         |              |                |
| `savings.view` / `open` / `dep`  |   ✓   |       |       ✓        |    ✓    |              | ✓ (เฉพาะ view) |
| `savings.close` / `cancel` (PIN) |   ✓   |       |       ✓        |         |              |                |
| `workorder.view` / `manage`      |   ✓   |       |       ✓        |    ✓    |      ✓       |                |
| **AMLO Compliance**              |       |       |                |         |              |                |
| `amlo.view` / `manage`           |   ✓   |       |       ✓        |         |              | ✓ (เฉพาะ view) |
| **Accounting & Financials**      |       |       |                |         |              |                |
| `accounting.view`                |   ✓   |       |       ✓        |         |              |       ✓        |
| `accounting.post` / `expense`    |   ✓   |       |       ✓        |         |              |       ✓        |
| `accounting.period_lock` / `un`  |   ✓   |       |       ✓        |         |              |                |
| `fraud.view`                     |   ✓   |       |       ✓        |         |              |       ✓        |

---

## 3. แบบจำลองภัยคุกคามและการรับมือ (Threat Scenarios & Controls)

### สถานการณ์ที่ 1: พนักงานทุจริตแอบ Void บิลย้อนหลังเพื่อขโมยเงินสด

- **การตรวจจับและป้องกัน:**
  - สิทธิ์ `sale.void` ต้องได้รับการอนุมัติแบบ **Maker-Checker** โดยผู้จัดการสาขา (หรือเจ้าของร้าน) เท่านั้น
  - การ Void จะต้องให้ผู้จัดการป้อนรหัส PIN ผ่านระบบ **Step-Up Authentication** (`requireApproval`)
  - ทุกธุรกรรมจะลงบันทึกในตาราง `audit_logs` แบบ Append-Only (ห้ามลบ/แก้ไขที่ระดับสิทธิ์แอป)

### สถานการณ์ที่ 2: ผู้บุกรุกยิง API ตรงเพื่อข้ามผ่านสิทธิ์หรือเข้าถึงข้อมูลต่างสาขา

- **การตรวจจับและป้องกัน:**
  - การตรวจสอบสิทธิ์แบบ **Branch Scoping** ถูกฝังลงในชั้นคิวรีของ Repository (`prisma.$transaction`) ไม่ได้เช็คเฉพาะที่ UI
  - มีการใช้ระบบ `requirePermission(prisma, userId, code, branchId)` เพื่อล็อกการดำเนินการข้ามสาขาอย่างสมบูรณ์

### สถานการณ์ที่ 3: พนักงานดักจับ Session Cookie หรือทำการ hijack ในเครือข่ายภายใน (LAN)

- **การตรวจจับและป้องกัน:**
  - คุกกี้เซสชันของระบบติดตั้งคุณสมบัติ `HttpOnly`, `SameSite=Lax` และใช้ `Secure` (เมื่อรันบน HTTPS) ป้องกันการขโมยผ่านสคริปต์ (XSS)
  - เซสชันจะหมดอายุแบบเลื่อน (Sliding Expiration) และสามารถยกเลิกเซสชันทั้งหมดของบัญชีนั้นๆ ได้ทันทีผ่านคำสั่งของ Admin/Owner

### สถานการณ์ที่ 4: ลูกค้า/พนักงาน Tampering ราคาทองระหว่างทำบิล

- **การตรวจจับและป้องกัน:**
  - ระบบจะคำนวณราคาทองและยอดสุทธิบน Server เท่านั้น โดยดึงราคาทองที่เป็นเวอร์ชัน Snapshot จากฐานข้อมูลหน้าร้าน ณ เสี้ยววินาทีที่ทำรายการ ห้ามเชื่อใจยอดรวมหรือค่ากำเหน็จที่คำนวณผ่าน Client ส่งมา

---

## 4. ผลการตรวจสอบ Dependency (Dependency Audit Report)

ผลการรัน `pnpm audit` ณ วันที่ 7 กรกฎาคม 2026 พบข้อแนะนำระดับปานกลาง (Moderate) 2 จุด:

1. **`@hono/node-server`** (เวอร์ชันมีช่องโหว่: `<1.19.13` -> ใช้ในระบบ Dev-tool ของ Prisma: `@prisma/dev`)
   - _สถานะ:_ ปลอดภัย เนื่องจากเป็นเครื่องมือฝั่ง Development เท่านั้น ไม่ถูกบิลด์ขึ้นระบบใช้งานจริง
2. **`postcss`** (เวอร์ชันมีช่องโหว่: `<8.5.10` -> ใช้ในแพ็กเกจ `next`)
   - _สถานะ:_ ปลอดภัย เนื่องจากใช้ในการประมวลผลสไตล์ชีตตอนบิลด์โปรเจกต์เท่านั้น (Build-time) ไม่มีผลกระทบระดับรันไทม์
