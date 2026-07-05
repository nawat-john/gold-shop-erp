import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { CreateBranchForm } from "./create-branch-form";
import { toggleBranchActiveAction } from "./actions";

export const metadata = { title: "สาขา — Gold Shop ERP" };

export default async function BranchesPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "branch.manage");

  const branches = await prisma.branch.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { userBranchRoles: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">สาขา</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2 pr-4">รหัส</th>
              <th className="py-2 pr-4">ชื่อ</th>
              <th className="py-2 pr-4">ที่อยู่</th>
              <th className="py-2 pr-4">ผู้ใช้</th>
              <th className="py-2 pr-4">สถานะ</th>
              <th className="py-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-mono">{b.code}</td>
                <td className="py-2 pr-4">{b.name}</td>
                <td className="py-2 pr-4">{b.address ?? "—"}</td>
                <td className="py-2 pr-4">{b._count.userBranchRoles}</td>
                <td className="py-2 pr-4">
                  {b.isActive ? (
                    <span className="text-green-700">ใช้งาน</span>
                  ) : (
                    <span className="text-red-600">ปิดใช้งาน</span>
                  )}
                </td>
                <td className="py-2">
                  <form action={toggleBranchActiveAction}>
                    <input type="hidden" name="branchId" value={b.id} />
                    <button
                      type="submit"
                      className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      {b.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateBranchForm />
    </div>
  );
}
