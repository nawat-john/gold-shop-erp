import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import {
  ReviewAlertForm,
  MarkReportedForm,
  AddWatchlistForm,
} from "./alert-forms";

export const metadata = { title: "AMLO — Gold Shop ERP" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "รอตรวจทาน",
  REVIEWED: "ตรวจทานแล้ว",
  REPORTED: "ส่งรายงานแล้ว",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  REPORTED: "bg-green-100 text-green-800",
};

export default async function AmloPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "amlo.view");

  const [alerts, watchlist] = await Promise.all([
    prisma.amloAlert.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true },
      take: 100,
    }),
    prisma.amloWatchlistEntry.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AMLO — แจ้งเตือนธุรกรรมเข้าเกณฑ์</h1>
        <a
          href="/admin/amlo/export"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Export CSV (90 วันล่าสุด)
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded border border-gray-200 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="p-3">วันที่</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3">ลูกค้า</th>
                <th className="p-3">มูลค่า</th>
                <th className="p-3">เฝ้าระวัง</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    ยังไม่มีแจ้งเตือน AMLO
                  </td>
                </tr>
              ) : (
                alerts.map((a) => (
                  <tr key={a.id} className="border-t border-gray-100">
                    <td className="p-3 text-xs">
                      {a.createdAt.toLocaleDateString("th-TH")}
                    </td>
                    <td className="p-3 text-xs">{a.refType}</td>
                    <td className="p-3">{a.customer?.name ?? "—"}</td>
                    <td className="p-3 font-mono">
                      {formatSatangAsBaht(a.amountSatang)} บาท
                    </td>
                    <td className="p-3">
                      {a.watchlistMatch ? (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          ตรงเฝ้าระวัง
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[a.status]}`}
                      >
                        {STATUS_LABEL[a.status]}
                      </span>
                    </td>
                    <td className="p-3">
                      {a.status === "PENDING" && (
                        <ReviewAlertForm alertId={a.id} />
                      )}
                      {a.status === "REVIEWED" && (
                        <MarkReportedForm alertId={a.id} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-1 rounded border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-sm border-b border-gray-100 pb-2">
            ทะเบียนเฝ้าระวัง
          </h2>
          <AddWatchlistForm />
          <ul className="flex flex-col gap-2 text-xs">
            {watchlist.map((w) => (
              <li key={w.id} className="border-b border-gray-50 pb-2">
                <span className="font-semibold">{w.name}</span>
                <br />
                <span className="text-gray-500">{w.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
