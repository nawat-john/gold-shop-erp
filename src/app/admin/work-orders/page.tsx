import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { getQueue } from "@/server/services/work-order.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { NewWorkOrderForm } from "./new-work-order-form";

export const metadata = { title: "งานช่าง/ซ่อม — Gold Shop ERP" };

const TYPE_LABEL: Record<string, string> = {
  CUSTOM_ORDER: "สั่งทำ",
  REPAIR: "ซ่อม",
};

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: "รับงานแล้ว",
  IN_PROGRESS: "กำลังดำเนินการ",
};

export default async function WorkOrdersPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "workorder.view");

  const [queue, branches] = await Promise.all([
    getQueue(prisma),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">งานช่าง/ซ่อม (คิวงาน)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 rounded border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-sm mb-3">รับงานใหม่</h2>
          <NewWorkOrderForm
            branches={branches.map((b) => ({
              id: b.id,
              code: b.code,
              name: b.name,
            }))}
          />
        </div>

        <div className="lg:col-span-2 rounded border border-gray-200 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="p-3">เลขที่ใบสั่งงาน</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3">รายละเอียด</th>
                <th className="p-3">มัดจำ</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    ไม่มีงานค้างในคิว
                  </td>
                </tr>
              ) : (
                queue.map((w) => (
                  <tr key={w.id} className="border-t border-gray-100">
                    <td className="p-3 font-mono text-xs">{w.docNo}</td>
                    <td className="p-3">{TYPE_LABEL[w.type]}</td>
                    <td className="p-3">{w.description}</td>
                    <td className="p-3 font-mono">
                      {formatSatangAsBaht(w.depositSatang)} บาท
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                        {STATUS_LABEL[w.status]}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/work-orders/${w.id}`}
                        className="text-amber-700 hover:underline text-xs font-semibold"
                      >
                        รายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
