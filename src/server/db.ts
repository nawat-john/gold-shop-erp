// PrismaClient singleton — ป้องกัน connection pool บวมตอน dev hot reload
// ทุก use case ที่แตะเงิน/ทอง ต้องห่อใน prisma.$transaction เสมอ (กติกาสถาปัตยกรรมข้อ 2)
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/config/env";
import { PrismaClient } from "@/generated/prisma/client";

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
