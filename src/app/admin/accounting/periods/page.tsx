import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  requirePermission,
  hasPermission,
} from "@/server/services/rbac.service";
import { LockPeriodButton, UnlockPeriodButton } from "./period-forms";

export const metadata = { title: "งวดบัญชี — Gold Shop ERP" };

export default async function AccountingPeriodsPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "accounting.view");
  const canLock = await hasPermission(
    prisma,
    session.user.id,
    "accounting.period_lock",
  );
  const canUnlock = await hasPermission(
    prisma,
    session.user.id,
    "accounting.period_unlock",
  );

  const periods = await prisma.accountingPeriod.findMany({
    orderBy: { yearMonth: "desc" },
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">งวดบัญชี</h1>
        <Link
          href="/admin/accounting"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้าบัญชี
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        งวดบัญชีที่ปิด (LOCKED)
        แล้วจะปฏิเสธการบันทึกธุรกรรมใหม่ทุกประเภทที่มีวันที่อยู่ในงวดนั้น
        ทั้งระบบ (ขาย/รับซื้อ/ขายฝาก/ออมทอง/งานช่าง/ค่าใช้จ่าย)
      </p>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="p-3">งวด</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3">ปิดงวดเมื่อ</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {periods.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  ยังไม่มีงวดบัญชี (จะสร้างอัตโนมัติเมื่อมีธุรกรรมแรกเข้ามา)
                </td>
              </tr>
            ) : (
              periods.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="p-3 font-mono">{p.yearMonth}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        p.status === "LOCKED"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {p.status === "LOCKED" ? "ปิดแล้ว" : "เปิดอยู่"}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {p.lockedAt ? p.lockedAt.toLocaleString("th-TH") : "—"}
                  </td>
                  <td className="p-3">
                    {p.status === "OPEN" && canLock && (
                      <LockPeriodButton yearMonth={p.yearMonth} />
                    )}
                    {p.status === "LOCKED" && canUnlock && (
                      <UnlockPeriodButton yearMonth={p.yearMonth} />
                    )}
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
