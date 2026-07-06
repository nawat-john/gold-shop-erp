import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { getExpenseReport } from "@/server/services/expense.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { ExpenseForm } from "./expense-form";

export const metadata = { title: "ค่าใช้จ่าย — Gold Shop ERP" };

export default async function ExpensesPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "expense.manage");

  const [branches, expenseAccounts, report] = await Promise.all([
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
    prisma.account.findMany({
      where: { type: "EXPENSE" },
      orderBy: { code: "asc" },
    }),
    getExpenseReport(prisma, {
      fromDate: new Date(Date.now() - 90 * 86_400_000),
      toDate: new Date(),
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">ค่าใช้จ่าย</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 rounded border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-sm mb-3">บันทึกค่าใช้จ่ายใหม่</h2>
          <ExpenseForm
            branches={branches.map((b) => ({
              id: b.id,
              code: b.code,
              name: b.name,
            }))}
            expenseAccounts={expenseAccounts.map((a) => ({
              code: a.code,
              name: a.name,
            }))}
          />
        </div>

        <div className="lg:col-span-2 rounded border border-gray-200 bg-white overflow-x-auto">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-sm">ประวัติ 90 วันล่าสุด</h2>
            <span className="text-sm font-mono font-semibold">
              รวม {formatSatangAsBaht(report.totalSatang)} บาท
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="p-3">เลขที่</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3">รายละเอียด</th>
                <th className="p-3 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {report.expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    ยังไม่มีรายการค่าใช้จ่าย
                  </td>
                </tr>
              ) : (
                report.expenses.map((e) => (
                  <tr key={e.id} className="border-t border-gray-100">
                    <td className="p-3 font-mono text-xs">{e.docNo}</td>
                    <td className="p-3 text-xs">{e.account.name}</td>
                    <td className="p-3">{e.description}</td>
                    <td className="p-3 text-right font-mono">
                      {formatSatangAsBaht(e.amountSatang)}
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
