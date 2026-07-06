import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { getCommissionReport } from "@/server/services/commission.service";
import { formatSatangAsBaht } from "@/server/domain/money";

export const metadata = { title: "ค่าคอมมิชชั่นพนักงาน — Gold Shop ERP" };

export default async function CommissionsPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "commission.view");

  const report = await getCommissionReport(prisma, {
    fromDate: new Date(Date.now() - 90 * 86_400_000),
    toDate: new Date(),
  });

  const totalsByStaff = new Map<
    string,
    { name: string; totalSatang: bigint }
  >();
  for (const c of report.commissions) {
    const existing = totalsByStaff.get(c.staffId);
    if (existing) {
      existing.totalSatang += c.amountSatang;
    } else {
      totalsByStaff.set(c.staffId, {
        name: c.staff.displayName,
        totalSatang: c.amountSatang,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          ค่าคอมมิชชั่นพนักงาน (90 วันล่าสุด)
        </h1>
        <span className="text-sm font-mono font-semibold">
          รวม {formatSatangAsBaht(report.totalSatang)} บาท
        </span>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <h2 className="font-semibold text-sm p-3 border-b border-gray-100">
          สรุปตามพนักงาน
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="p-3">พนักงาน</th>
              <th className="p-3 text-right">ยอดคอมมิชชั่นรวม</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(totalsByStaff.values()).map((s) => (
              <tr key={s.name} className="border-t border-gray-100">
                <td className="p-3">{s.name}</td>
                <td className="p-3 text-right font-mono">
                  {formatSatangAsBaht(s.totalSatang)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <h2 className="font-semibold text-sm p-3 border-b border-gray-100">
          รายการทั้งหมด
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="p-3">วันที่</th>
              <th className="p-3">พนักงาน</th>
              <th className="p-3">บิลขาย</th>
              <th className="p-3">อัตรา</th>
              <th className="p-3 text-right">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            {report.commissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  ยังไม่มีค่าคอมมิชชั่น (ต้องตั้งค่าอัตราก่อนในหน้าตั้งค่า)
                </td>
              </tr>
            ) : (
              report.commissions.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="p-3 text-xs">
                    {c.createdAt.toLocaleDateString("th-TH")}
                  </td>
                  <td className="p-3">{c.staff.displayName}</td>
                  <td className="p-3 font-mono text-xs">
                    {c.salesOrder.docNo}
                  </td>
                  <td className="p-3">{Number(c.ratePercent)}%</td>
                  <td className="p-3 text-right font-mono">
                    {formatSatangAsBaht(c.amountSatang)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
