import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import {
  getProfitAndLoss,
  getVatReport,
  getCashBankLedger,
  getBalanceSheetSummary,
} from "@/server/services/accounting-reports.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { ACCOUNT_CODES } from "@/server/domain/chart-of-accounts";

export const metadata = { title: "รายงานบัญชี — Gold Shop ERP" };

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default async function AccountingReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; branchId?: string }>;
}) {
  const { from, to, branchId } = await searchParams;
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "accounting.view");

  const now = new Date();
  const fromDate = from ? new Date(from) : startOfMonth(now);
  const toDate = to ? new Date(to) : now;
  const selectedBranchId = branchId || undefined;

  const [branches, pnl, vat, cashLedger, bankLedger, balanceSheet] =
    await Promise.all([
      prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { code: "asc" },
      }),
      getProfitAndLoss(prisma, fromDate, toDate, selectedBranchId),
      getVatReport(prisma, fromDate, toDate, selectedBranchId),
      getCashBankLedger(
        prisma,
        ACCOUNT_CODES.cash,
        fromDate,
        toDate,
        selectedBranchId,
      ),
      getCashBankLedger(
        prisma,
        ACCOUNT_CODES.bank,
        fromDate,
        toDate,
        selectedBranchId,
      ),
      getBalanceSheetSummary(prisma, toDate, selectedBranchId),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">รายงานบัญชี</h1>
        <Link
          href="/admin/accounting"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้าบัญชี
        </Link>
      </div>

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
            <option value="">ทุกสาขา (รวมศูนย์)</option>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-sm border-b border-gray-100 pb-2 mb-3">
            งบกำไรขาดทุน (P&amp;L)
          </h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">รายได้เนื้อทอง</dt>
            <dd className="text-right font-mono">
              {formatSatangAsBaht(pnl.goldRevenueSatang)}
            </dd>
            <dt className="text-gray-500">ต้นทุนขายทอง</dt>
            <dd className="text-right font-mono">
              ({formatSatangAsBaht(pnl.cogsGoldSatang)})
            </dd>
            <dt className="font-semibold">กำไรเนื้อทอง</dt>
            <dd className="text-right font-mono font-semibold">
              {formatSatangAsBaht(pnl.goldProfitSatang)}
            </dd>
            <dt className="text-gray-500">รายได้ค่ากำเหน็จ</dt>
            <dd className="text-right font-mono">
              {formatSatangAsBaht(pnl.laborRevenueSatang)}
            </dd>
            <dt className="text-gray-500">รายได้ดอกเบี้ยขายฝาก</dt>
            <dd className="text-right font-mono">
              {formatSatangAsBaht(pnl.interestIncomeSatang)}
            </dd>
            <dt className="text-gray-500">รายได้ค่าบริการซ่อม</dt>
            <dd className="text-right font-mono">
              {formatSatangAsBaht(pnl.repairIncomeSatang)}
            </dd>
            <dt className="text-gray-500">ค่าใช้จ่ายทั่วไป</dt>
            <dd className="text-right font-mono">
              ({formatSatangAsBaht(pnl.generalExpensesSatang)})
            </dd>
            <dt className="text-gray-500">ค่าคอมมิชชั่น</dt>
            <dd className="text-right font-mono">
              ({formatSatangAsBaht(pnl.commissionExpenseSatang)})
            </dd>
            <dt className="border-t border-gray-100 pt-2 font-bold text-amber-700">
              กำไรสุทธิ
            </dt>
            <dd className="border-t border-gray-100 pt-2 text-right font-mono font-bold text-amber-700">
              {formatSatangAsBaht(pnl.netProfitSatang)}
            </dd>
          </dl>
        </div>

        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-sm border-b border-gray-100 pb-2 mb-3">
            รายงาน VAT (สำหรับ ภ.พ.30)
          </h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">ภาษีขาย (Output VAT)</dt>
            <dd className="text-right font-mono">
              {formatSatangAsBaht(vat.outputVatSatang)}
            </dd>
            <dt className="text-gray-500">
              ภาษีซื้อ (Input VAT) — ยังไม่รองรับ
            </dt>
            <dd className="text-right font-mono">
              {formatSatangAsBaht(vat.inputVatSatang)}
            </dd>
            <dt className="border-t border-gray-100 pt-2 font-bold">
              ภาษีมูลค่าเพิ่มสุทธิที่ต้องนำส่ง
            </dt>
            <dd className="border-t border-gray-100 pt-2 text-right font-mono font-bold">
              {formatSatangAsBaht(vat.netVatPayableSatang)}
            </dd>
          </dl>

          <h2 className="font-semibold text-sm border-b border-gray-100 pb-2 mb-3 mt-6">
            ฐานะการเงินเบื้องต้น ณ {toDate.toLocaleDateString("th-TH")}
          </h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">สินทรัพย์รวม</dt>
            <dd className="text-right font-mono">
              {formatSatangAsBaht(balanceSheet.totalAssetsSatang)}
            </dd>
            <dt className="text-gray-500">หนี้สินรวม</dt>
            <dd className="text-right font-mono">
              {formatSatangAsBaht(balanceSheet.totalLiabilitiesSatang)}
            </dd>
            <dt className="text-gray-500">ทุน</dt>
            <dd className="text-right font-mono">
              {formatSatangAsBaht(balanceSheet.totalEquitySatang)}
            </dd>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded border border-gray-200 bg-white overflow-x-auto">
          <h2 className="font-semibold text-sm p-3 border-b border-gray-100">
            สมุดเงินสด
          </h2>
          <table className="w-full text-xs">
            <tbody>
              {cashLedger.map((row, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="p-2 whitespace-nowrap">
                    {row.entryDate.toLocaleDateString("th-TH")}
                  </td>
                  <td className="p-2">{row.description}</td>
                  <td className="p-2 text-right font-mono">
                    {row.debitSatang > 0n
                      ? formatSatangAsBaht(row.debitSatang)
                      : `(${formatSatangAsBaht(row.creditSatang)})`}
                  </td>
                  <td className="p-2 text-right font-mono font-semibold">
                    {formatSatangAsBaht(row.runningBalanceSatang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded border border-gray-200 bg-white overflow-x-auto">
          <h2 className="font-semibold text-sm p-3 border-b border-gray-100">
            สมุดธนาคาร
          </h2>
          <table className="w-full text-xs">
            <tbody>
              {bankLedger.map((row, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="p-2 whitespace-nowrap">
                    {row.entryDate.toLocaleDateString("th-TH")}
                  </td>
                  <td className="p-2">{row.description}</td>
                  <td className="p-2 text-right font-mono">
                    {row.debitSatang > 0n
                      ? formatSatangAsBaht(row.debitSatang)
                      : `(${formatSatangAsBaht(row.creditSatang)})`}
                  </td>
                  <td className="p-2 text-right font-mono font-semibold">
                    {formatSatangAsBaht(row.runningBalanceSatang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
