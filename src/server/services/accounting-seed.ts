// Seed ผังบัญชีมาตรฐาน — idempotent (upsert) ใช้ร่วมกันทั้ง prisma/seed.ts และ integration tests
import type { Db } from "@/server/db";
import { CHART_OF_ACCOUNTS } from "@/server/domain/chart-of-accounts";

export async function seedChartOfAccounts(db: Db): Promise<void> {
  for (const { code, name, type } of CHART_OF_ACCOUNTS) {
    await db.account.upsert({
      where: { code },
      update: { name, type },
      create: { code, name, type, isSystem: true },
    });
  }
}
