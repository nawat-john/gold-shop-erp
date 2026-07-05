import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";

export const metadata = { title: "บทบาท — Gold Shop ERP" };

export default async function RolesPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "role.manage");

  const roles = await prisma.role.findMany({
    orderBy: { code: "asc" },
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { userBranchRoles: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">บทบาทและสิทธิ์</h1>
        <p className="text-sm text-gray-500">
          บทบาทระบบ sync จาก permission catalog ตอน seed —
          การแก้สิทธิ์รายบทบาทจะเพิ่มใน Phase ถัดไป
        </p>
      </div>

      {roles.map((role) => (
        <section key={role.id} className="rounded border border-gray-200 p-4">
          <h2 className="font-semibold">
            {role.name}{" "}
            <span className="font-mono text-sm text-gray-500">
              ({role.code})
            </span>
            {role.isSystem && (
              <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs">
                system
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600">{role.description}</p>
          <p className="mt-1 text-xs text-gray-500">
            ผู้ใช้ที่ได้รับบทบาทนี้: {role._count.userBranchRoles} คน
          </p>
          <ul className="mt-2 flex flex-wrap gap-1">
            {role.rolePermissions.length === 0 ? (
              <li className="text-sm text-gray-400">
                ยังไม่มีสิทธิ์ (จะเพิ่มใน Phase ถัดไป)
              </li>
            ) : (
              role.rolePermissions.map((rp) => (
                <li
                  key={rp.permissionId}
                  title={rp.permission.description}
                  className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs"
                >
                  {rp.permission.code}
                </li>
              ))
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
