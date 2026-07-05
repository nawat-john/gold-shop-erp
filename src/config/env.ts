// Server-only: ห้าม import จาก client component — ค่า env ผ่านการ validate ด้วย zod
// ถ้า env ไม่ครบ/ผิดรูปแบบ แอปต้อง fail ตั้งแต่ start ไม่ใช่พังกลางทาง
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  /// กุญแจ AES-256-GCM สำหรับ field อ่อนไหว (TOTP secret, เลขบัตร ปชช.) — 32 bytes hex
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-f]{64}$/i, "ต้องเป็น hex 64 ตัวอักษร (32 bytes)"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
