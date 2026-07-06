import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { formatMgAsGrams } from "@/server/domain/gold";
import { OpenAccountForm } from "./open-account-form";

export const metadata = { title: "ออมทอง — Gold Shop ERP" };

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "ใช้งานอยู่",
  CLOSED_GOLD: "ปิดบัญชี (รับทอง)",
  CLOSED_CASH: "ปิดบัญชี (รับเงินคืน)",
  CLOSED_DEFAULTED: "ปิดบัญชี (ผิดนัด)",
};

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "bg-blue-100 text-blue-800",
  CLOSED_GOLD: "bg-green-100 text-green-800",
  CLOSED_CASH: "bg-gray-100 text-gray-800",
  CLOSED_DEFAULTED: "bg-red-100 text-red-800",
};

export default async function SavingsPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "savings.view");

  const [accounts, branches] = await Promise.all([
    prisma.savingsAccount.findMany({
      orderBy: { createdAt: "desc" },
      include: { branch: true, customer: true },
      take: 100,
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ออมทอง (Gold Savings)</h1>
        <Link
          href="/admin/savings/liability"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          รายงานภาระผูกพัน
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 rounded border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-sm mb-3">เปิดบัญชีใหม่</h2>
          <OpenAccountForm
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
                <th className="p-3">เลขที่บัญชี</th>
                <th className="p-3">ลูกค้า</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3">ยอดสะสม</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    ยังไม่มีบัญชีออมทองในระบบ
                  </td>
                </tr>
              ) : (
                accounts.map((a) => (
                  <tr key={a.id} className="border-t border-gray-100">
                    <td className="p-3 font-mono text-xs">{a.docNo}</td>
                    <td className="p-3">{a.customer?.name ?? "ลูกค้าจร"}</td>
                    <td className="p-3">
                      {a.accountType === "CASH_SAVINGS"
                        ? "ออมเงิน"
                        : "ออมน้ำหนัก"}
                    </td>
                    <td className="p-3 font-mono">
                      {a.accountType === "CASH_SAVINGS"
                        ? `${formatSatangAsBaht(a.balanceSatang)} บาท`
                        : `${formatMgAsGrams(a.balanceWeightMg)} กรัม`}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[a.status]}`}
                      >
                        {STATUS_LABEL[a.status]}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/savings/${a.id}`}
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
