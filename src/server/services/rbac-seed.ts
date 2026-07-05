// Seed RBAC — idempotent (upsert) ใช้ร่วมกันทั้ง prisma/seed.ts และ integration tests
import type { Db } from "@/server/db";
import {
  PERMISSIONS,
  SYSTEM_ROLES,
  type PermissionCode,
} from "@/server/auth/permissions";

export async function seedRbac(db: Db): Promise<void> {
  // 1) permissions ตาม catalog
  for (const [code, description] of Object.entries(PERMISSIONS)) {
    await db.permission.upsert({
      where: { code },
      update: { description },
      create: { code, description },
    });
  }

  // 2) system roles + ผูก permission (sync ให้ตรง catalog เสมอ)
  for (const [code, def] of Object.entries(SYSTEM_ROLES)) {
    const role = await db.role.upsert({
      where: { code },
      update: { name: def.name, description: def.description },
      create: {
        code,
        name: def.name,
        description: def.description,
        isSystem: true,
      },
    });

    await db.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (def.permissions.length > 0) {
      const permissions = await db.permission.findMany({
        where: { code: { in: def.permissions as PermissionCode[] } },
        select: { id: true },
      });
      await db.rolePermission.createMany({
        data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
      });
    }
  }
}
