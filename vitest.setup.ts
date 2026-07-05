// โหลด .env ถ้ามี แล้วเติมค่า default สำหรับ test ที่ขาด — ให้ unit test รันได้ทุกเครื่องรวมถึง CI
import "dotenv/config";

process.env.ENCRYPTION_KEY ??=
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
process.env.DATABASE_URL ??=
  "postgresql://gold:gold_dev_password@localhost:5432/gold_shop_erp";
process.env.REDIS_URL ??= "redis://localhost:6379";
