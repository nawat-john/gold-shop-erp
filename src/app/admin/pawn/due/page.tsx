import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { listDueContracts } from "@/server/services/pawn.service";
import { formatSatangAsBaht } from "@/server/domain/money";

export const metadata = { title: "รายการใกล้ครบกำหนด — Gold Shop ERP" };

export default async function PawnDueListPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.view");

  const contracts = await listDueContracts(prisma, { withinDays: 7 });
  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          รายการใกล้/เกินครบกำหนด (Call List)
        </h1>
        <Link
          href="/admin/pawn"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้ารายการ
        </Link>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="p-3">เลขที่สัญญา</th>
              <th className="p-3">ลูกค้า</th>
              <th className="p-3">เบอร์โทร</th>
              <th className="p-3">เงินต้น</th>
              <th className="p-3">ครบกำหนด</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  ไม่มีสัญญาใกล้หรือเกินครบกำหนดภายใน 7 วัน
                </td>
              </tr>
            ) : (
              contracts.map((c) => {
                const overdue = c.dueDate.getTime() < now;
                return (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="p-3 font-mono text-xs">{c.docNo}</td>
                    <td className="p-3">{c.customerName}</td>
                    <td className="p-3">{c.customerPhone ?? "—"}</td>
                    <td className="p-3 font-mono">
                      {formatSatangAsBaht(c.principalSatang)} บาท
                    </td>
                    <td className="p-3">
                      {c.dueDate.toLocaleDateString("th-TH")}
                      {overdue && (
                        <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                          เกินกำหนด
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/pawn/${c.id}`}
                        className="text-amber-700 hover:underline text-xs font-semibold"
                      >
                        รายละเอียด
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
