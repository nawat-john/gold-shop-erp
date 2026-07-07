import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const CONTAINER_NAME = "gold-shop-postgres";
const DB_USER = "gold";
const DB_NAME = "gold_shop_erp";
const BACKUP_DIR = path.join(process.cwd(), "backups");

async function backup() {
  console.log("=== เริ่มต้นกระบวนการสำรองข้อมูล (Backup) ===");

  // สร้างโฟลเดอร์สำหรับเก็บ backup
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`สร้างโฟลเดอร์สำหรับเก็บสำรองข้อมูล: ${BACKUP_DIR}`);
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/T/, "_")
    .replace(/\..+/, "")
    .replace(/:/g, "-");
  const filename = `backup_${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    console.log(`กำลังเชื่อมต่อกับ Container: ${CONTAINER_NAME}...`);

    // สั่ง pg_dump จาก Docker Container และดึงข้อมูลมาเขียนลงไฟล์ตรงๆ
    // ใช้ --clean และ --if-exists เพื่อให้เขียนทับข้อมูลเดิมได้ง่ายตอน restore
    const command = `docker exec ${CONTAINER_NAME} pg_dump -U ${DB_USER} -d ${DB_NAME} --clean --if-exists`;

    console.log(`กำลังรันคำสั่ง: ${command}`);
    const dump = execSync(command, { maxBuffer: 100 * 1024 * 1024 }); // กำหนด buffer ขนาด 100MB

    fs.writeFileSync(filepath, dump);

    console.log(`สำรองข้อมูลเสร็จเรียบร้อย!`);
    console.log(`ไฟล์สำรองข้อมูล: backups/${filename}`);
    console.log(`ขนาดไฟล์: ${(dump.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("เกิดข้อผิดพลาดระหว่างการสำรองข้อมูล:", errorMessage);
    process.exitCode = 1;
  }
}

backup();
