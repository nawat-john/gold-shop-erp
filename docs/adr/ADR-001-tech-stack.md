# ADR-001: Tech Stack

- **สถานะ:** Accepted (2026-07-05)
- **บริบท:** ระบบ ERP ร้านทองไทย เน้น reliability + security, พัฒนาบน local เท่านั้น (ยังไม่ deploy), ทีมเล็ก 2–3 คน

## การตัดสินใจ

| Layer           | เลือกใช้                                                                                  | หมายเหตุ                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Frontend + BFF  | Next.js 15.5 (App Router) + TypeScript strict (target ES2022)                             | ES2022 จำเป็นสำหรับ bigint literals                                                                     |
| UI              | Tailwind CSS 4 (+ shadcn/ui, TanStack Table/Query, React Hook Form เมื่อถึง Phase ที่ใช้) | ติดตั้งเมื่อเริ่มใช้จริง ไม่ลงล่วงหน้า                                                                  |
| Database        | PostgreSQL 16 (Docker)                                                                    | ACID, row lock, NUMERIC                                                                                 |
| ORM             | **Prisma 7** + `@prisma/adapter-pg`                                                       | v7 ต้องใช้ driver adapter; config อยู่ที่ `prisma.config.ts`; client generate ลง `src/generated/prisma` |
| Cache/Queue     | Redis 7 + BullMQ (ติดตั้ง BullMQ ตอน Phase 2)                                             |                                                                                                         |
| Auth            | Auth.js (NextAuth v5) + Argon2id + TOTP — Phase 1                                         |                                                                                                         |
| Validation      | Zod 4 (แชร์ client/server)                                                                | หมายเหตุ: Zod 4 ใช้ `z.url()` แทน `z.string().url()`                                                    |
| Testing         | Vitest 4 (unit), Testcontainers (integration), Playwright (E2E)                           | integration แยก config: `vitest.config.integration.ts`                                                  |
| Logging         | pino + pino-pretty (dev) พร้อม redact PII                                                 |                                                                                                         |
| Package manager | pnpm (บังคับ approve build scripts ผ่าน `pnpm-workspace.yaml`)                            |                                                                                                         |

## ทางเลือกที่ตัดทิ้ง

- **Drizzle** — Prisma ชนะเรื่อง migration workflow และ schema เป็นเอกสารอ่านง่าย
- **NUMERIC(14,2) สำหรับเงิน** — ดู ADR-002

## ผลกระทบ

- Prisma 7 เพิ่งออก — API ต่างจาก v5/v6 (ไม่มี `url` ใน datasource block ของ schema, ต้องมี adapter) ทีมต้องอ่าน docs v7
- dev HTTPS ใช้ `next dev --experimental-https` แทน mkcert เต็มรูปแบบไปก่อน (พอสำหรับทดสอบพฤติกรรม secure cookie)
