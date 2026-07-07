# Runbook: การสำรองและกู้คืนข้อมูลระบบ (Database Backup & Restore)

เอกสารนี้ระเบียบปฏิบัติและคู่มือการสำรองข้อมูล (Backup) และกู้คืนข้อมูล (Restore) ฐานข้อมูล PostgreSQL สำหรับระบบ Gold Shop ERP บนสภาพแวดล้อม Local Development

---

## 1. ข้อมูลทั่วไป (General Information)

- **เทคโนโลยี:** PostgreSQL 16 (ผ่าน Docker Container ชื่อ `gold-shop-postgres`)
- **ผู้ใช้ดีฟอลต์:** `gold`
- **ฐานข้อมูลหลัก:** `gold_shop_erp`
- **โฟลเดอร์เก็บข้อมูลสำรอง:** `./backups/`
- **ไฟล์สคริปต์หลัก:**
  - [db-backup.ts](file:///d:/Code/gold-shop-erp/scripts/db-backup.ts) — รันสำรองข้อมูลออกเป็นไฟล์ `.sql`
  - [db-restore.ts](file:///d:/Code/gold-shop-erp/scripts/db-restore.ts) — กู้ข้อมูลจากไฟล์กลับเข้าไปในระบบ

---

## 2. ขั้นตอนการสำรองข้อมูล (Backup Procedure)

### 2.1 การสำรองข้อมูลแบบ Manual (เรียกผ่านสคริปต์)

รันคำสั่งด้านล่างเพื่อสำรองข้อมูล ณ ปัจจุบัน:

```bash
npx tsx scripts/db-backup.ts
```

สคริปต์จะสร้างไฟล์ SQL แบบ `--clean` (มีคำสั่ง Drop Table/Constraint ก่อนเขียนทับ) ในรูปแบบ:
`backups/backup_YYYY-MM-DD_HH-mm-ss.sql`

### 2.2 การตั้งค่าสำรองข้อมูลอัตโนมัติ (Automated Backup)

สำหรับโปรดักชันจำลองหรือการรันบนโลคัลระยะยาว แนะนำให้ตั้งค่า Job สำรองข้อมูล:

#### บน Windows (Task Scheduler)

1. เปิด **Task Scheduler**
2. เลือก **Create Basic Task...**
3. ตั้งชื่อตัวงาน เช่น `GoldShopERP-DB-Backup` และกำหนดความถี่เป็น **Daily** (ทุกวัน)
4. เลือก Action เป็น **Start a program**
5. ในช่อง Program/script ให้ระบุเส้นทางไปที่ `node` หรือตัวรันสคริปต์
6. ในช่อง Add arguments ให้ป้อนค่า:
   `d:\Code\gold-shop-erp\node_modules\tsx\dist\cli.js d:\Code\gold-shop-erp\scripts\db-backup.ts`
7. ระบุ Cwd (Start in) เป็น: `d:\Code\gold-shop-erp`

#### บน Linux/macOS (Cron)

เพิ่มบรรทัดนี้ลงใน `crontab -e` เพื่อรันสคริปต์ทุกวันตอนเที่ยงคืน:

```bash
0 0 * * * cd /path/to/gold-shop-erp && npx tsx scripts/db-backup.ts >> /var/log/gold-backup.log 2>&1
```

---

## 3. ขั้นตอนการกู้คืนข้อมูล (Restore Procedure)

> [!CAUTION]
> **คำเตือนความเสี่ยงสูง:** การกู้คืนข้อมูล (Restore) จะเขียนทับข้อมูลในตารางทั้งหมดที่มีอยู่ปัจจุบันตามโครงสร้างไฟล์ SQL แนะนำให้กดสำรองข้อมูล (Backup) อีกครั้งไว้เพื่อความปลอดภัยก่อนรันการกู้คืนข้อมูล

### 3.1 การกู้คืนจากไฟล์ล่าสุด (Latest Backup)

หากระบบล่มหรือต้องการย้อนสถานะกลับไปจุดล่าสุด ให้รันคำสั่งโดยไม่ระบุอาร์กิวเมนต์:

```bash
npx tsx scripts/db-restore.ts
```

สคริปต์จะค้นหาไฟล์ที่มีนามสกุล `.sql` ที่แก้ไขล่าสุดในโฟลเดอร์ `backups/` และนำเข้าข้อมูลให้ทันที

### 3.2 การกู้คืนจากไฟล์ที่เจาะจง

หากมีไฟล์ที่จองไว้หรือต้องการย้อนประวัติไปยังจุดเวลานั้นๆ ให้ใส่ชื่อไฟล์หรือพาธหลังคำสั่ง:

```bash
npx tsx scripts/db-restore.ts backup_2026-07-07_17-40-00.sql
```

หรือระบุพาธตรงตัว:

```bash
npx tsx scripts/db-restore.ts d:\Code\gold-shop-erp\backups\backup_specific.sql
```

---

## 4. แผนซ้อมกู้คืนข้อมูล (Restore Rehearsal Plan)

เพื่อยืนยันว่าสคริปต์กู้คืนทำงานได้จริง (Definition of Done) ให้ปฏิบัติดังนี้:

1. สร้างข้อมูลการทดสอบ เช่น เพิ่มข้อมูลลูกค้า 1 ราย
2. รันสคริปต์สำรองข้อมูลเพื่อรับไฟล์ล่าสุด: `npx tsx scripts/db-backup.ts`
3. ลบข้อมูลลูกค้ารายนั้นออก หรือสลับไปเพิ่มข้อมูลขยะอื่นๆ เพื่อทำลายสถานะข้อมูลปัจจุบัน
4. รันสคริปต์กู้คืนข้อมูล: `npx tsx scripts/db-restore.ts`
5. เปิดระบบตรวจสอบ หรือตรวจสอบผ่าน database client ว่าระบบกลับคืนสู่สถานะเดิมหลังการซ้อมกู้ข้อมูลจริง
