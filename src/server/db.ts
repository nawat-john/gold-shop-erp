// PrismaClient singleton — ป้องกัน connection pool บวมตอน dev hot reload
// ทุก use case ที่แตะเงิน/ทอง ต้องห่อใน prisma.$transaction เสมอ (กติกาสถาปัตยกรรมข้อ 2)
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/config/env";
import { PrismaClient, type Prisma } from "@/generated/prisma/client";

/// รับได้ทั้ง client ปกติและ transaction client — service/repository ทุกตัวใช้ type นี้
export type Db = PrismaClient | Prisma.TransactionClient;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
