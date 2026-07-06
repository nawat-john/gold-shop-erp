import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import {
  getVoidLeaderboard,
  getStockAdjustLeaderboard,
  getOffHoursActivity,
} from "@/server/services/fraud-report.service";
import { formatSatangAsBaht } from "@/server/domain/money";

export const metadata = { title: "Fraud Dashboard — Gold Shop ERP" };

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default async function FraudDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; branchId?: string }>;
}) {
  const { from, to, branchId } = await searchParams;
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "fraud.view");

  const now = new Date();
  const fromDate = from ? new Date(from) : startOfMonth(now);
  const toDate = to ? new Date(to) : now;
  const selectedBranchId = branchId || undefined;

  const [branches, voidLeaderboard, stockAdjustLeaderboard, offHoursActivity] =
    await Promise.all([
      prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { code: "asc" },
      }),
      getVoidLeaderboard(prisma, {
        fromDate,
        toDate,
        branchId: selectedBranchId,
      }),
      getStockAdjustLeaderboard(prisma, {
        fromDate,
        toDate,
        branchId: selectedBranchId,
      }),
      getOffHoursActivity(prisma, {
        fromDate,
        toDate,
        branchId: selectedBranchId,
      }),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Fraud Dashboard</h1>
      <p className="text-xs text-gray-500 italic max-w-3xl">
        รายงานนี้เป็นการเฝ้าระวังเชิงสถิติจากข้อมูลที่มีอยู่ (void / ปรับสต๊อก /
        กิจกรรมนอกเวลาทำการ) ไม่ใช่การพิสูจน์การทุจริต —
        ใช้เป็นจุดเริ่มต้นสอบทานเท่านั้น
      </p>

      <form className="flex gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            จากวันที่
          </label>
          <input
            type="date"
            name="from"
            defaultValue={fromDate.toISOString().slice(0, 10)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            ถึงวันที่
          </label>
          <input
            type="date"
            name="to"
            defaultValue={toDate.toISOString().slice(0, 10)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">สาขา</label>
          <select
            name="branchId"
            defaultValue={selectedBranchId ?? ""}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">ทุกสาขา</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          ดูรายงาน
        </button>
      </form>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <h2 className="font-semibold text-sm p-3 border-b border-gray-100">
          อันดับอัตรา Void ต่อพนักงาน (ขาย + รับซื้อ)
        </h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="p-2">พนักงาน</th>
              <th className="p-2 text-right">บิลทั้งหมด</th>
              <th className="p-2 text-right">Void</th>
              <th className="p-2 text-right">อัตรา Void</th>
              <th className="p-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {voidLeaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  ไม่มีข้อมูลในช่วงเวลานี้
                </td>
              </tr>
            ) : (
              voidLeaderboard.map((row) => (
                <tr key={row.actorId} className="border-t border-gray-50">
                  <td className="p-2">{row.actorName}</td>
                  <td className="p-2 text-right font-mono">{row.totalCount}</td>
                  <td className="p-2 text-right font-mono">{row.voidCount}</td>
                  <td className="p-2 text-right font-mono">
                    {row.voidRatePercent.toFixed(1)}%
                  </td>
                  <td className="p-2">
                    {row.flagged && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-red-800 font-semibold">
                        ผิดปกติ
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <h2 className="font-semibold text-sm p-3 border-b border-gray-100">
          อันดับผู้อนุมัติปรับสต๊อก (Stock Count)
        </h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="p-2">ผู้อนุมัติ</th>
              <th className="p-2 text-right">จำนวนครั้งที่อนุมัติ</th>
              <th className="p-2 text-right">มูลค่ารวมที่ปรับ</th>
              <th className="p-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {stockAdjustLeaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  ไม่มีข้อมูลในช่วงเวลานี้
                </td>
              </tr>
            ) : (
              stockAdjustLeaderboard.map((row) => (
                <tr key={row.approverId} className="border-t border-gray-50">
                  <td className="p-2">{row.approverName}</td>
                  <td className="p-2 text-right font-mono">
                    {row.approvalCount}
                  </td>
                  <td className="p-2 text-right font-mono">
                    {formatSatangAsBaht(row.totalMagnitudeSatang)}
                  </td>
                  <td className="p-2">
                    {row.flagged && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-red-800 font-semibold">
                        ผิดปกติ
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <h2 className="font-semibold text-sm p-3 border-b border-gray-100">
          กิจกรรม Void / ปรับสต๊อก / โอนเงินนอกเวลาทำการ (ก่อน 08:00 หรือหลัง
          20:00)
        </h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="p-2">เวลา</th>
              <th className="p-2">พนักงาน</th>
              <th className="p-2">การกระทำ</th>
              <th className="p-2">อ้างอิง</th>
            </tr>
          </thead>
          <tbody>
            {offHoursActivity.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  ไม่มีกิจกรรมนอกเวลาทำการในช่วงเวลานี้
                </td>
              </tr>
            ) : (
              offHoursActivity.map((row, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="p-2 whitespace-nowrap">
                    {row.createdAt.toLocaleString("th-TH")}
                  </td>
                  <td className="p-2">{row.actorName}</td>
                  <td className="p-2 font-mono">{row.action}</td>
                  <td className="p-2 font-mono">
                    {row.entityType}
                    {row.entityId ? `:${row.entityId}` : ""}
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
