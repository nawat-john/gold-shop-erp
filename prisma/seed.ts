// Seed — idempotent (รันซ้ำได้): `pnpm prisma db seed`
// สร้าง: permission catalog + system roles, สาขา HQ, บัญชี owner เริ่มต้น
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedRbac } from "../src/server/services/rbac-seed";
import { seedChartOfAccounts } from "../src/server/services/accounting-seed";
import { hashPassword } from "../src/server/security/password";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const OWNER_USERNAME = "owner";
// dev เท่านั้น — เปลี่ยนผ่าน SEED_OWNER_PASSWORD หรือ reset ในระบบทันทีหลังติดตั้ง
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe-Owner-1";

async function main() {
  await seedRbac(prisma);
  console.log("seed: RBAC catalog (permissions + system roles) เรียบร้อย");

  await seedChartOfAccounts(prisma);
  console.log("seed: ผังบัญชี (Chart of Accounts) เรียบร้อย");

  const hq = await prisma.branch.upsert({
    where: { code: "HQ" },
    update: {},
    create: { code: "HQ", name: "สำนักงานใหญ่" },
  });
  console.log("seed: สาขา HQ เรียบร้อย");

  // สร้าง owner เฉพาะครั้งแรก — ห้าม overwrite รหัสผ่านตอน seed ซ้ำ
  const existing = await prisma.user.findUnique({
    where: { username: OWNER_USERNAME },
  });
  if (!existing) {
    const ownerRole = await prisma.role.findUniqueOrThrow({
      where: { code: "OWNER" },
    });
    await prisma.user.create({
      data: {
        username: OWNER_USERNAME,
        displayName: "เจ้าของร้าน",
        passwordHash: await hashPassword(OWNER_PASSWORD),
        userBranchRoles: {
          create: { branchId: hq.id, roleId: ownerRole.id },
        },
      },
    });
    console.log(
      `seed: สร้างผู้ใช้ ${OWNER_USERNAME} แล้ว — เปลี่ยนรหัสผ่านทันทีหลัง login ครั้งแรก`,
    );
  } else {
    console.log(`seed: ผู้ใช้ ${OWNER_USERNAME} มีอยู่แล้ว — ข้าม`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
