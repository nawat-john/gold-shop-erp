import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { formatMgAsGrams } from "@/server/domain/gold";
import { formatSatangAsBaht } from "@/server/domain/money";

export const metadata = { title: "ขายฝากทอง — Gold Shop ERP" };

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "ใช้งานอยู่",
  REDEEMED: "ไถ่ถอนแล้ว",
  FORFEITED: "หลุดแล้ว",
  CANCELLED: "ยกเลิก",
};

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "bg-blue-100 text-blue-800",
  REDEEMED: "bg-green-100 text-green-800",
  FORFEITED: "bg-gray-200 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function PawnListPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.view");

  const contracts = await prisma.pawnContract.findMany({
    orderBy: { createdAt: "desc" },
    include: { branch: true, location: true },
    take: 100,
  });

  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ขายฝากทอง (Pawn)</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/pawn/due"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            รายการใกล้ครบกำหนด
          </Link>
          <Link
            href="/admin/pawn/new"
            className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            เปิดสัญญาใหม่
          </Link>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="p-3">เลขที่สัญญา</th>
              <th className="p-3">ลูกค้า</th>
              <th className="p-3">ทรัพย์</th>
              <th className="p-3">เงินต้น</th>
              <th className="p-3">อัตราดอกเบี้ย</th>
              <th className="p-3">ครบกำหนด</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  ยังไม่มีสัญญาขายฝากในระบบ
                </td>
              </tr>
            ) : (
              contracts.map((c) => {
                const overdue =
                  c.status === "ACTIVE" && c.dueDate.getTime() < now;
                return (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="p-3 font-mono text-xs">{c.docNo}</td>
                    <td className="p-3">{c.customerName}</td>
                    <td className="p-3">
                      {c.description}
                      <br />
                      <span className="text-xs text-gray-500">
                        {formatMgAsGrams(c.weightMg)} กรัม /{" "}
                        {Number(c.goldPurity)}%
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      {formatSatangAsBaht(c.principalSatang)} บาท
                    </td>
                    <td className="p-3">
                      {Number(c.annualInterestRatePercent)}%/ปี
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
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[c.status]}`}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
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
