import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { formatMgAsGrams } from "@/server/domain/gold";
import { StockScanner } from "./scanner";

export const metadata = { title: "รายละเอียดการตรวจนับสต๊อก — Gold Shop ERP" };

export default async function StockCountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.count");

  const resolvedParams = await params;
  const countId = resolvedParams.id;

  const count = await prisma.stockCount.findUnique({
    where: { id: countId },
    include: {
      branch: true,
      items: {
        include: {
          item: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!count) notFound();

  // แยกรายการเพื่อแสดงผล
  const expectedItems = count.items.filter((it) => it.expected);
  const unexpectedItems = count.items.filter((it) => !it.expected);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold font-mono text-amber-900">
            {count.docNo}
          </h1>
          <span
            className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
              count.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : count.status === "REVIEW"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {count.status}
          </span>
        </div>
        <Link
          href="/admin/inventory/stock-counts"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          ย้อนกลับ
        </Link>
      </div>

      {/* ข้อมูลพื้นฐานรอบนับ */}
      <section className="rounded border border-gray-200 p-4 bg-white grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-500 font-semibold">สาขา:</span>{" "}
          {count.branch.name} ({count.branch.code})
        </div>
        <div>
          <span className="text-gray-500 font-semibold">เริ่มนับเมื่อ:</span>{" "}
          {count.startedAt.toLocaleString("th-TH")}
        </div>
        <div>
          <span className="text-gray-500 font-semibold">ปิดยอดนับเมื่อ:</span>{" "}
          {count.closedAt ? count.closedAt.toLocaleString("th-TH") : "—"}
        </div>
        <div>
          <span className="text-gray-500 font-semibold">บันทึกช่วยจำ:</span>{" "}
          {count.note || "—"}
        </div>
      </section>

      {/* เครื่องสแกนบาร์โค้ด (เปิดเฉพาะรอบที่ยัง OPEN) */}
      {count.status === "OPEN" && (
        <section className="flex justify-center">
          <StockScanner countId={count.id} />
        </section>
      )}

      {/* ตารางแสดงรายละเอียดการตรวจนับ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* รายการคาดหมายคลังสินค้า (Expected Items) */}
        <div className="rounded border border-gray-200 p-4 bg-white">
          <h2 className="text-base font-bold border-b border-gray-100 pb-2 mb-3">
            รายการสินค้าที่ต้องตรวจนับ ({expectedItems.length})
          </h2>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th className="py-2 pr-3">ป้ายสินค้า</th>
                  <th className="py-2 pr-3">แบบสินค้า (SKU)</th>
                  <th className="py-2 pr-3">น้ำหนัก</th>
                  <th className="py-2">ผลนับ</th>
                </tr>
              </thead>
              <tbody>
                {expectedItems.map((cItem) => (
                  <tr key={cItem.itemId} className="border-b border-gray-100">
                    <td className="py-2 pr-3 font-mono">
                      {cItem.item.serialNo}
                    </td>
                    <td className="py-2 pr-3">
                      {cItem.item.product.name} ({cItem.item.product.sku})
                    </td>
                    <td className="py-2 pr-3 font-mono">
                      {formatMgAsGrams(cItem.item.weightMg)} กรัม
                    </td>
                    <td className="py-2 font-semibold">
                      {cItem.found === true ? (
                        <span className="text-green-700">✓ พบตัว</span>
                      ) : cItem.found === false ? (
                        <span className="text-red-600">⚠ หาย</span>
                      ) : (
                        <span className="text-gray-400 italic">
                          ยังไม่ได้ตรวจ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* รายการเกินสต๊อก (Unexpected Items) */}
        <div className="rounded border border-gray-200 p-4 bg-white">
          <h2 className="text-base font-bold border-b border-gray-100 pb-2 mb-3">
            รายการเกินสต๊อก / ตรวจพบเพิ่ม ({unexpectedItems.length})
          </h2>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th className="py-2 pr-3">ป้ายสินค้า</th>
                  <th className="py-2 pr-3">แบบสินค้า (SKU)</th>
                  <th className="py-2 pr-3">น้ำหนัก</th>
                  <th className="py-2">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {unexpectedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-gray-400 italic"
                    >
                      ไม่มีรายการสแกนเกินคลังในรอบนี้
                    </td>
                  </tr>
                ) : (
                  unexpectedItems.map((cItem) => (
                    <tr key={cItem.itemId} className="border-b border-gray-100">
                      <td className="py-2 pr-3 font-mono">
                        {cItem.item.serialNo}
                      </td>
                      <td className="py-2 pr-3">
                        {cItem.item.product.name} ({cItem.item.product.sku})
                      </td>
                      <td className="py-2 pr-3 font-mono">
                        {formatMgAsGrams(cItem.item.weightMg)} กรัม
                      </td>
                      <td className="py-2 font-semibold text-blue-600">
                        + เกินคลังสแกนพบ
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
