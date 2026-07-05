import pino from "pino";
import { env } from "@/config/env";

// redact: กัน PII/secret หลุดลง log ตามข้อกำหนด security ของโปรเจกต์
// เพิ่ม path ใหม่ทุกครั้งที่มี field อ่อนไหวเพิ่ม (เลขบัตร ปชช., เลขบัญชี, รหัสผ่าน)
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "*.password",
      "*.pin",
      "*.nationalId",
      "*.citizenId",
      "*.bankAccountNo",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
  transport:
    env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
