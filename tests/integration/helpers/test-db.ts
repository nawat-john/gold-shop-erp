// Helper กลางสำหรับ integration test: Postgres container จริง + migrate + Prisma client
import { execSync } from "node:child_process";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

export interface TestDb {
  container: StartedPostgreSqlContainer;
  prisma: PrismaClient;
  databaseUrl: string;
}

export async function startTestDb(): Promise<TestDb> {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const databaseUrl = container.getConnectionUri();

  execSync("pnpm exec prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  return { container, prisma, databaseUrl };
}

export async function stopTestDb(testDb: TestDb | undefined): Promise<void> {
  await testDb?.prisma.$disconnect();
  await testDb?.container.stop();
}
