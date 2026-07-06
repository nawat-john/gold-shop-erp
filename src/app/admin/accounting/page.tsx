import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  requirePermission,
  hasPermission,
} from "@/server/services/rbac.service";
import { getTrialBalance } from "@/server/services/accounting-reports.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { BackfillForm } from "./backfill-form";

export const metadata = { title: "บัญชี — Gold Shop ERP" };

const TYPE_LABEL: Record<string, string> = {
  ASSET: "สินทรัพย์",
  LIABILITY: "หนี้สิน",
  EQUITY: "ทุน",
  REVENUE: "รายได้",
  EXPENSE: "ค่าใช้จ่าย",
};

export default async function AccountingPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "accounting.view");
  const canPost = await hasPermission(
    prisma,
    session.user.id,
    "accounting.post",
  );

  const trialBalance = await getTrialBalance(prisma);
  const recentEntries = await prisma.journalEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { lines: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">บัญชี (Accounting)</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/accounting/periods"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            งวดบัญชี
          </Link>
          <Link
            href="/admin/accounting/reports"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            รายงานบัญชี
          </Link>
          <Link
            href="/admin/expenses"
            className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            บันทึกค่าใช้จ่าย
          </Link>
        </div>
      </div>

      {!trialBalance.isBalanced && (
        <div className="rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-semibold">
          ⚠ งบทดลองไม่สมดุล! debit{" "}
          {formatSatangAsBaht(trialBalance.totalDebitSatang)} ≠ credit{" "}
          {formatSatangAsBaht(trialBalance.totalCreditSatang)} — ต้องตรวจสอบด่วน
        </div>
      )}

      {canPost && (
        <div className="rounded border border-gray-200 bg-white p-4">
          <BackfillForm />
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="p-3">รหัสบัญชี</th>
              <th className="p-3">ชื่อบัญชี</th>
              <th className="p-3">ประเภท</th>
              <th className="p-3 text-right">ยอดคงเหลือ</th>
            </tr>
          </thead>
          <tbody>
            {trialBalance.rows
              .filter((r) => r.debitSatang > 0n || r.creditSatang > 0n)
              .map((r) => (
                <tr key={r.code} className="border-t border-gray-100">
                  <td className="p-3 font-mono text-xs">{r.code}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3 text-xs text-gray-500">
                    {TYPE_LABEL[r.type]}
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatSatangAsBaht(r.balanceSatang)}
                  </td>
                </tr>
              ))}
            <tr className="border-t-2 border-gray-300 font-semibold">
              <td className="p-3" colSpan={3}>
                รวม (Debit / Credit)
              </td>
              <td className="p-3 text-right font-mono">
                {formatSatangAsBaht(trialBalance.totalDebitSatang)} /{" "}
                {formatSatangAsBaht(trialBalance.totalCreditSatang)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <h2 className="font-semibold text-sm p-3 border-b border-gray-100">
          ใบสำคัญบัญชีล่าสุด
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="p-3">เลขที่</th>
              <th className="p-3">วันที่</th>
              <th className="p-3">รายละเอียด</th>
              <th className="p-3 text-right">มูลค่า</th>
            </tr>
          </thead>
          <tbody>
            {recentEntries.map((e) => (
              <tr key={e.id} className="border-t border-gray-100">
                <td className="p-3 font-mono text-xs">{e.entryNo}</td>
                <td className="p-3 text-xs">
                  {e.entryDate.toLocaleDateString("th-TH")}
                </td>
                <td className="p-3">{e.description}</td>
                <td className="p-3 text-right font-mono">
                  {formatSatangAsBaht(
                    e.lines.reduce((s, l) => s + l.debitSatang, 0n),
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
