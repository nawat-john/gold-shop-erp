# Gold Shop ERP (ระบบ ERP ร้านทองไทย)

ระบบ ERP ครบวงจรสำหรับร้านทองไทย: POS ซื้อ-ขาย, ขายฝาก/จำนำ, ออมทอง, สต๊อก, บัญชี-ภาษี, CRM/KYC, หลายสาขา

แผนงานและสถาปัตยกรรมทั้งหมดอยู่ใน [`gold-shop-erp-plan.md`](./gold-shop-erp-plan.md) — กติกาสำหรับผู้พัฒนา (และ AI assistant) อยู่ใน [`CLAUDE.md`](./CLAUDE.md)

## Setup (Local Development)

ต้องมี: Node.js ≥ 20, pnpm ≥ 9, Docker Desktop

```bash
# 1. ติดตั้ง dependencies
pnpm install

# 2. สร้างไฟล์ env
cp .env.example .env

# 3. เปิด infrastructure (PostgreSQL 16, Redis 7, Mailhog)
docker compose up -d

# 4. สร้าง Prisma client + รัน migration + seed
pnpm db:generate
pnpm db:migrate
pnpm prisma db seed

# 5. รันแอป
pnpm dev
```

เปิด <http://localhost:3000> — Mailhog UI อยู่ที่ <http://localhost:8025>

บัญชีเริ่มต้นจาก seed (dev เท่านั้น): `owner` / `ChangeMe-Owner-1` (เปลี่ยนได้ผ่าน env `SEED_OWNER_PASSWORD`) — เปลี่ยนรหัสผ่านทันทีหลัง login ที่หน้า "โปรไฟล์"

## คำสั่งที่ใช้บ่อย

| คำสั่ง                          | ทำอะไร                         |
| ------------------------------- | ------------------------------ |
| `pnpm dev`                      | รัน dev server (Turbopack)     |
| `pnpm build`                    | production build               |
| `pnpm lint` / `pnpm typecheck`  | ESLint / TypeScript ตรวจ type  |
| `pnpm test` / `pnpm test:watch` | รัน unit tests (Vitest)        |
| `pnpm test:coverage`            | รัน test พร้อม coverage report |
| `pnpm format`                   | จัด format ด้วย Prettier       |
| `pnpm db:migrate`               | สร้าง/รัน Prisma migration     |
| `pnpm db:studio`                | เปิด Prisma Studio ดูข้อมูล    |

## โครงสร้างโปรเจกต์

```
src/
├── app/                  # Next.js App Router (UI + Route Handlers)
├── config/               # env config (zod-validated) — server-only
├── lib/                  # shared utilities (logger ฯลฯ)
└── server/               # ห้าม import จาก client
    ├── domain/           # pure business logic: เงิน (สตางค์ bigint), น้ำหนักทอง (มก. bigint)
    ├── services/         # use cases: pricing, pawn interest, VAT ฯลฯ
    └── repositories/     # DB access (Prisma) — เรียกภายใน transaction เท่านั้น
prisma/                   # schema + migrations
```

## กติกาสำคัญ (อ่านก่อนเขียนโค้ด)

- **เงิน = `bigint` หน่วยสตางค์** ห้ามใช้ float กับเงินเด็ดขาด (`src/server/domain/money.ts`)
- **น้ำหนักทอง = `bigint` หน่วยมิลลิกรัม** ตรงกับ `NUMERIC(10,3)` กรัมใน DB (`src/server/domain/gold.ts`)
- เอกสารการเงินแก้ไม่ได้ — ใช้ void/reversal เท่านั้น
- ทุกธุรกรรมเงิน/ทอง = 1 DB transaction + row lock, ทุก endpoint ผ่าน auth → permission → zod → audit log
