// RBAC — deny-by-default + branch scoping
// สิทธิ์ผูกกับ (user, branch, role): permission ใช้ได้เฉพาะสาขาที่ได้รับมอบหมาย
// action ระดับองค์กร (ไม่ระบุ branch) ต้องมี permission นั้นในสาขาใดสาขาหนึ่งที่ยัง active
import type { Db } from "@/server/db";
import type { PermissionCode } from "@/server/auth/permissions";

export class ForbiddenError extends Error {
  constructor(
    public readonly permission: string,
    public readonly branchId?: string | null,
  ) {
    super(`ไม่มีสิทธิ์ ${permission}${branchId ? ` ในสาขา ${branchId}` : ""}`);
    this.name = "ForbiddenError";
  }
}

/** คืน permission ทั้งหมดของ user — ถ้าระบุ branchId จะเอาเฉพาะ role ของสาขานั้น */
export async function getUserPermissions(
  db: Db,
  userId: string,
  branchId?: string,
): Promise<ReadonlySet<string>> {
  const assignments = await db.userBranchRole.findMany({
    where: {
      userId,
      ...(branchId ? { branchId } : {}),
      branch: { isActive: true },
      user: { isActive: true },
    },
    select: {
      role: {
        select: {
          rolePermissions: {
            select: { permission: { select: { code: true } } },
          },
        },
      },
    },
  });

  const codes = new Set<string>();
  for (const a of assignments) {
    for (const rp of a.role.rolePermissions) {
      codes.add(rp.permission.code);
    }
  }
  return codes;
}

/** ตรวจสิทธิ์แบบ boolean — ใช้ในจุดที่อยากแสดง/ซ่อน UI */
export async function hasPermission(
  db: Db,
  userId: string,
  permission: PermissionCode,
  branchId?: string,
): Promise<boolean> {
  const permissions = await getUserPermissions(db, userId, branchId);
  return permissions.has(permission);
}

/** ตรวจสิทธิ์แบบบังคับ — ไม่มีสิทธิ์ = throw ForbiddenError (ใช้ในทุก server action/route) */
export async function requirePermission(
  db: Db,
  userId: string,
  permission: PermissionCode,
  branchId?: string,
): Promise<void> {
  if (!(await hasPermission(db, userId, permission, branchId))) {
    throw new ForbiddenError(permission, branchId);
  }
}
