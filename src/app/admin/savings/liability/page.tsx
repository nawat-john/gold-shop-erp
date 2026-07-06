import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { getLiabilityReport } from "@/server/services/savings.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { formatMgAsGrams } from "@/server/domain/gold";

export const metadata = { title: "รายงานภาระผูกพันออมทอง — Gold Shop ERP" };

export default async function SavingsLiabilityPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "savings.view");

  const report = await getLiabilityReport(prisma);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">รายงานภาระผูกพันออมทอง</h1>
        <Link
          href="/admin/savings"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้าออมทอง
        </Link>
      </div>

      {report.feedStale && (
        <div className="rounded bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
          ⚠ ราคาทองอาจไม่ใช่ราคาล่าสุด — มูลค่าประเมินอาจคลาดเคลื่อน
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">บัญชีออมเงิน (CASH_SAVINGS)</p>
          <p className="font-mono font-semibold">
            {formatSatangAsBaht(report.cashSavingsTotalSatang)} บาท
          </p>
          <p className="text-xs text-gray-500">
            {report.cashSavingsAccountCount} บัญชี
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">
            บัญชีออมน้ำหนัก (WEIGHT_SAVINGS)
          </p>
          <p className="font-mono font-semibold">
            {formatMgAsGrams(report.weightSavingsTotalWeightMg)} กรัม
          </p>
          <p className="text-xs text-gray-500">
            {report.weightSavingsAccountCount} บัญชี — ประเมินมูลค่า{" "}
            {formatSatangAsBaht(report.weightSavingsEstimatedLiabilitySatang)}{" "}
            บาท
          </p>
        </div>
        <div className="col-span-2 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">ภาระผูกพันรวมโดยประมาณ</p>
          <p className="font-mono font-bold text-lg text-amber-700">
            {formatSatangAsBaht(report.totalEstimatedLiabilitySatang)} บาท
          </p>
        </div>
      </div>
    </div>
  );
}
