import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { CreateUserForm } from "./create-user-form";
import { revokeUserSessionsAction, toggleUserActiveAction } from "./actions";

export const metadata = { title: "ผู้ใช้ — Gold Shop ERP" };

export default async function UsersPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "user.view");

  const [users, roles, branches] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        userBranchRoles: {
          include: { role: true, branch: true },
        },
        _count: {
          select: { sessions: { where: { revokedAt: null } } },
        },
      },
    }),
    prisma.role.findMany({ orderBy: { code: "asc" } }),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">ผู้ใช้งาน</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2 pr-4">username</th>
              <th className="py-2 pr-4">ชื่อ</th>
              <th className="py-2 pr-4">บทบาท (สาขา)</th>
              <th className="py-2 pr-4">2FA</th>
              <th className="py-2 pr-4">สถานะ</th>
              <th className="py-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-mono">{u.username}</td>
                <td className="py-2 pr-4">{u.displayName}</td>
                <td className="py-2 pr-4">
                  {u.userBranchRoles
                    .map((ubr) => `${ubr.role.name} (${ubr.branch.code})`)
                    .join(", ") || "—"}
                </td>
                <td className="py-2 pr-4">{u.totpEnabled ? "เปิด" : "ปิด"}</td>
                <td className="py-2 pr-4">
                  {u.isActive ? (
                    <span className="text-green-700">ใช้งาน</span>
                  ) : (
                    <span className="text-red-600">ปิดใช้งาน</span>
                  )}
                </td>
                <td className="flex gap-2 py-2">
                  {u.id !== session.user.id && (
                    <form action={toggleUserActiveAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        {u.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                      </button>
                    </form>
                  )}
                  {u._count.sessions > 0 && (
                    <form action={revokeUserSessionsAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        บังคับออก ({u._count.sessions})
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateUserForm
        roles={roles.map((r) => ({ id: r.id, label: `${r.name} (${r.code})` }))}
        branches={branches.map((b) => ({
          id: b.id,
          label: `${b.name} (${b.code})`,
        }))}
      />
    </div>
  );
}
