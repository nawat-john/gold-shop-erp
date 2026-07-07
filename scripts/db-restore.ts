import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const CONTAINER_NAME = "gold-shop-postgres";
const DB_USER = "gold";
const DB_NAME = "gold_shop_erp";
const BACKUP_DIR = path.join(process.cwd(), "backups");

async function restore() {
  console.log("=== เริ่มต้นกระบวนการกู้คืนข้อมูล (Restore) ===");

  let backupFile = process.argv[2];

  if (!backupFile) {
    console.log(
      "ไม่ได้ระบุไฟล์สำรองข้อมูลใน Argument กำลังค้นหาไฟล์ล่าสุดในโฟลเดอร์ backups...",
    );
    if (!fs.existsSync(BACKUP_DIR)) {
      console.error(`ข้อผิดพลาด: ไม่พบโฟลเดอร์ backups (${BACKUP_DIR})`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith(".sql"))
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      console.error("ข้อผิดพลาด: ไม่พบไฟล์ .sql ในโฟลเดอร์ backups");
      process.exit(1);
    }

    backupFile = path.join(BACKUP_DIR, files[0].name);
  } else {
    // ถ้าผู้ใช้ระบุแต่ชื่อไฟล์ ให้ต่อพาธให้
    if (!path.isAbsolute(backupFile)) {
      backupFile = path.join(BACKUP_DIR, backupFile);
    }
  }

  if (!fs.existsSync(backupFile)) {
    console.error(`ข้อผิดพลาด: ไม่พบไฟล์สำรองข้อมูลที่ระบุ: ${backupFile}`);
    process.exit(1);
  }

  console.log(`ไฟล์สำรองข้อมูลที่จะกู้คืน: ${backupFile}`);
  console.log(
    `ขนาดไฟล์: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`,
  );
  console.log(`กำลังเชื่อมต่อกับ Container: ${CONTAINER_NAME}...`);

  // รัน psql ภายใน container
  const child = spawn("docker", [
    "exec",
    "-i", // ใช้ -i เพื่อรับ input stream
    CONTAINER_NAME,
    "psql",
    "-U",
    DB_USER,
    "-d",
    DB_NAME,
  ]);

  // สตรีมไฟล์ backup เข้า stdin ของ docker exec psql
  const fileStream = fs.createReadStream(backupFile);
  fileStream.pipe(child.stdin);

  let stderrData = "";
  child.stderr.on("data", (data) => {
    stderrData += data.toString();
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log("กู้คืนข้อมูลเสร็จสิ้นสมบูรณ์!");
    } else {
      console.error(`การกู้คืนข้อมูลล้มเหลวด้วย Exit Code: ${code}`);
      console.error("รายละเอียดข้อผิดพลาด (stderr):");
      console.error(stderrData);
      process.exit(code ?? 1);
    }
  });
}

restore();
