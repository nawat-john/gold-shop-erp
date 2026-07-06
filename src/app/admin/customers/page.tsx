import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";

export const metadata = { title: "ลูกค้า (CRM) — Gold Shop ERP" };

const TIER_LABEL: Record<string, string> = {
  BRONZE: "ทองแดง",
  SILVER: "เงิน",
  GOLD: "ทอง",
};

export default async function CustomersPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "customer.view");

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ลูกค้า (CRM)</h1>
        <Link
          href="/admin/customers/new"
          className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          ลงทะเบียนลูกค้าใหม่
        </Link>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="p-3">รหัสลูกค้า</th>
              <th className="p-3">ชื่อ</th>
              <th className="p-3">เบอร์โทร</th>
              <th className="p-3">แต้มสะสม</th>
              <th className="p-3">ระดับ</th>
              <th className="p-3">ยินยอม PDPA</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  ยังไม่มีลูกค้าลงทะเบียนในระบบ
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="p-3 font-mono text-xs">{c.code}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.phone ?? "—"}</td>
                  <td className="p-3">
                    {c.loyaltyPoints.toLocaleString("th-TH")}
                  </td>
                  <td className="p-3">{TIER_LABEL[c.tier]}</td>
                  <td className="p-3">
                    {c.consentGivenAt && !c.consentWithdrawnAt ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                        ยินยอมแล้ว
                      </span>
                    ) : (
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        ยังไม่ยินยอม
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/customers/${c.id}`}
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
  );
}
