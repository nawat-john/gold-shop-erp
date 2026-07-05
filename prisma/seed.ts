// Seed framework — รันด้วย `pnpm prisma db seed`
// กติกา: seed ต้อง idempotent (รันซ้ำได้ไม่พังไม่ซ้ำ) — ใช้ upsert เสมอ
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // Phase 1 เป็นต้นไป: seed roles/permissions/branches/settings ที่นี่
  console.log("seed: ยังไม่มีข้อมูลตั้งต้น (จะเพิ่มใน Phase 1)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
