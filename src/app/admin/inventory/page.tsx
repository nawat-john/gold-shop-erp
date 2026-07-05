import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  requirePermission,
  hasPermission,
} from "@/server/services/rbac.service";
import { getValuationReport } from "@/server/services/inventory.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { formatMgAsGrams } from "@/server/domain/gold";

export const metadata = { title: "จัดการคลังสินค้า — Gold Shop ERP" };

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.view");

  const queryParams = await searchParams;
  const branchId = queryParams.branchId || undefined;

  const [branches, report, recentMovements] = await Promise.all([
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
    getValuationReport(prisma, branchId),
    prisma.stockMovement.findMany({
      where: branchId ? { branchId } : {},
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        branch: true,
        product: true,
        item: true,
      },
    }),
  ]);

  const canReceive = await hasPermission(
    prisma,
    session.user.id,
    "stock.receive",
  );
  const canTransfer = await hasPermission(
    prisma,
    session.user.id,
    "stock.transfer",
  );
  const canCount = await hasPermission(prisma, session.user.id, "stock.count");
  const canMelt = await hasPermission(prisma, session.user.id, "stock.melt");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ระบบจัดการคลังสินค้า (Inventory)</h1>
        <div className="flex gap-2">
          {canReceive && (
            <Link
              href="/admin/inventory/receive"
              className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              + รับเข้าสินค้าจาก Supplier
            </Link>
          )}
        </div>
      </div>

      {/* ลิงก์ไปยังฟังก์ชันเสริมต่าง ๆ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {canTransfer && (
          <Link
            href="/admin/inventory/transfers"
            className="flex flex-col p-4 border border-gray-200 rounded hover:bg-amber-50"
          >
            <span className="font-semibold text-amber-900">
              โอนย้ายสินค้า 2-Step
            </span>
            <span className="text-xs text-gray-500">
              สร้างและตรวจรับสินค้าโอนข้ามสาขา
            </span>
          </Link>
        )}
        {canCount && (
          <Link
            href="/admin/inventory/stock-counts"
            className="flex flex-col p-4 border border-gray-200 rounded hover:bg-amber-50"
          >
            <span className="font-semibold text-amber-900">
              ตรวจนับสต๊อกสินค้า
            </span>
            <span className="text-xs text-gray-500">
              ตรวจสอบความถูกต้องและปรับปรุงยอด
            </span>
          </Link>
        )}
        {canMelt && (
          <Link
            href="/admin/inventory/melt-lots"
            className="flex flex-col p-4 border border-gray-200 rounded hover:bg-amber-50"
          >
            <span className="font-semibold text-amber-900">ส่งทองเก่าหลอม</span>
            <span className="text-xs text-gray-500">
              รวบรวมทองชำรุดส่งหลอมคืนโรงงาน
            </span>
          </Link>
        )}
      </div>

      {/* ค้นหาและคัดกรองสาขา */}
      <section className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded border border-gray-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">
            คัดกรองสาขา
          </label>
          <form method="get" className="flex gap-2">
            <select
              name="branchId"
              defaultValue={branchId || ""}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="">ทุกสาขา (รวมศูนย์)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded bg-gray-800 px-4 py-1.5 text-sm font-semibold text-white hover:bg-gray-900"
            >
              ตกลง
            </button>
          </form>
        </div>
      </section>

      {/* สรุปมูลค่าสต๊อกสินค้า (Valuation Dashboard) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-semibold">
            จำนวนสินค้าคงเหลือสุทธิ
          </p>
          <p className="text-2xl font-bold font-mono mt-1">
            {report.totalItems} ชิ้น
          </p>
        </div>
        <div className="rounded border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-semibold">น้ำหนักทองคำรวม</p>
          <p className="text-2xl font-bold font-mono mt-1">
            {formatMgAsGrams(report.totalWeightMg)} กรัม
          </p>
        </div>
        <div className="rounded border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-semibold">
            ราคาทุนสต๊อกสินค้า
          </p>
          <p className="text-2xl font-bold font-mono mt-1">
            {formatSatangAsBaht(report.totalCostSatang)} บาท
          </p>
        </div>
        <div className="rounded border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-semibold">
            มูลค่าสต๊อกตามราคาตลาด (Mark-to-Market)
          </p>
          <p className="text-2xl font-bold font-mono mt-1 text-amber-700">
            {formatSatangAsBaht(report.totalMarketValueSatang)} บาท
          </p>
        </div>
      </section>

      {/* ตารางสต๊อกสินค้าแยกตามผลิตภัณฑ์ */}
      <section className="rounded border border-gray-200 p-4">
        <h2 className="text-lg font-bold mb-4">
          รายงานสต๊อกรายสินค้า (Stock Registry)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 pr-4">SKU / แบบสินค้า</th>
                <th className="py-2 pr-4">การติดตาม</th>
                <th className="py-2 pr-4">ความบริสุทธิ์</th>
                <th className="py-2 pr-4">จำนวน</th>
                <th className="py-2 pr-4">น้ำหนักรวม (กรัม)</th>
                <th className="py-2 pr-4">ราคาทุนรวม</th>
                <th className="py-2 pr-4">มูลค่าตลาด</th>
                <th className="py-2">กำไรตามราคาตลาด (Unrealized)</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-500">
                    ไม่มีสินค้าคงคลังที่คัดกรอง
                  </td>
                </tr>
              ) : (
                report.rows.map((row) => (
                  <tr key={row.productId} className="border-b border-gray-100">
                    <td className="py-2 pr-4">
                      <span className="font-semibold">{row.name}</span>
                      <br />
                      <span className="text-xs text-gray-500 font-mono">
                        {row.sku}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs font-mono">
                      {row.tracking}
                    </td>
                    <td className="py-2 pr-4 font-mono">{row.goldPurity}%</td>
                    <td className="py-2 pr-4 font-mono">{row.totalQuantity}</td>
                    <td className="py-2 pr-4 font-mono">
                      {formatMgAsGrams(row.totalWeightMg)}
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {formatSatangAsBaht(row.totalCostSatang)}
                    </td>
                    <td className="py-2 pr-4 font-mono text-amber-800">
                      {formatSatangAsBaht(row.marketValueSatang)}
                    </td>
                    <td
                      className={`py-2 font-mono font-semibold ${
                        row.unrealizedProfitSatang >= 0n
                          ? "text-green-700"
                          : "text-red-600"
                      }`}
                    >
                      {formatSatangAsBaht(row.unrealizedProfitSatang)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ประวัติการเคลื่อนไหวสต๊อกสินค้าล่าสุด */}
      <section className="rounded border border-gray-200 p-4">
        <h2 className="text-lg font-bold mb-4">
          ประวัติการเคลื่อนไหวสต๊อกล่าสุด (Ledger Logs)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 pr-4">เวลา</th>
                <th className="py-2 pr-4">สาขา</th>
                <th className="py-2 pr-4">ประเภทรายการ</th>
                <th className="py-2 pr-4">สินค้า</th>
                <th className="py-2 pr-4">ป้ายสินค้า (Serial)</th>
                <th className="py-2 pr-4">จำนวน</th>
                <th className="py-2 pr-4">น้ำหนักรวม (กรัม)</th>
                <th className="py-2">เอกสารอ้างอิง</th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-500">
                    ไม่มีการเคลื่อนไหวสต๊อกล่าสุด
                  </td>
                </tr>
              ) : (
                recentMovements.map((move) => (
                  <tr
                    key={move.id.toString()}
                    className="border-b border-gray-100"
                  >
                    <td className="py-2 pr-4 text-xs font-mono">
                      {move.createdAt.toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 pr-4">{move.branch.name}</td>
                    <td className="py-2 pr-4 text-xs font-mono">
                      {move.movementType}
                    </td>
                    <td className="py-2 pr-4">{move.product.name}</td>
                    <td className="py-2 pr-4 font-mono">
                      {move.item?.serialNo || "—"}
                    </td>
                    <td
                      className={`py-2 pr-4 font-mono font-semibold ${
                        move.quantity > 0 ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {formatMgAsGrams(move.weightMg)}
                    </td>
                    <td className="py-2 text-xs font-mono">
                      {move.refType ? `${move.refType}: ${move.refId}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
