// Integration test กับ Postgres จริง (Testcontainers)
// ทดสอบ invariant สำคัญที่สุดของเลขที่เอกสาร: ยิงพร้อมกันแล้ว "ไม่ซ้ำ ไม่ข้าม"
// ต้องมี Docker รันอยู่ — รันด้วย `pnpm test:integration`
import { execSync } from "node:child_process";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { allocateDocumentNumber } from "@/server/services/document-number.service";
import { PrismaClient } from "@/generated/prisma/client";

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const databaseUrl = container.getConnectionUri();

  execSync("pnpm exec prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });

  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
}, 180_000);

afterAll(async () => {
  await prisma?.$disconnect();
  await container?.stop();
});

describe("allocateDocumentNumber", () => {
  it("จองเลขพร้อมกัน 100 transactions → ได้ 1..100 ไม่ซ้ำ ไม่ข้าม", async () => {
    const key = "TAXINV-BKK01-2569";

    const numbers = await Promise.all(
      Array.from({ length: 100 }, () =>
        prisma.$transaction((tx) => allocateDocumentNumber(tx, key), {
          maxWait: 60_000,
          timeout: 60_000,
        }),
      ),
    );

    const sorted = [...numbers].sort((a, b) => (a < b ? -1 : 1));
    expect(sorted).toEqual(
      Array.from({ length: 100 }, (_, i) => BigInt(i + 1)),
    );
  }, 120_000);

  it("transaction rollback แล้วเลขถูกคืน — ไม่เกิด gap", async () => {
    const key = "ROLLBACK-TEST-2569";

    await expect(
      prisma.$transaction(async (tx) => {
        await allocateDocumentNumber(tx, key);
        throw new Error("จำลองการสร้างเอกสารล้มเหลว");
      }),
    ).rejects.toThrow("จำลองการสร้างเอกสารล้มเหลว");

    const next = await prisma.$transaction((tx) =>
      allocateDocumentNumber(tx, key),
    );
    expect(next).toBe(1n);
  }, 60_000);

  it("แต่ละ key มี sequence แยกอิสระ", async () => {
    const a = await prisma.$transaction((tx) =>
      allocateDocumentNumber(tx, "SEQ-A-2569"),
    );
    const b = await prisma.$transaction((tx) =>
      allocateDocumentNumber(tx, "SEQ-B-2569"),
    );
    expect(a).toBe(1n);
    expect(b).toBe(1n);
  }, 60_000);
});
