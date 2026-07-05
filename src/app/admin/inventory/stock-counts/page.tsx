import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  requirePermission,
  hasPermission,
} from "@/server/services/rbac.service";
import { submitReviewAction } from "../actions";
import { ApproveStockForm } from "./approve-form";
import { StartCountForm } from "./start-count-form";

export const metadata = { title: "การตรวจนับสต๊อก — Gold Shop ERP" };

export default async function StockCountsPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.count");

  const [counts, branches] = await Promise.all([
    prisma.stockCount.findMany({
      orderBy: { createdAt: "desc" },
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
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
  ]);

  const canAdjust = await hasPermission(
    prisma,
    session.user.id,
    "stock.adjust",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ตรวจนับสต๊อกสินค้า (Stock Count)</h1>
        <Link
          href="/admin/inventory"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้าคลังสินค้า
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ฟอร์มเปิดรอบนับสต๊อกใหม่ */}
        <div className="lg:col-span-1 rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
          <h2 className="font-semibold text-lg border-b border-gray-100 pb-2">
            เปิดรอบตรวจนับใหม่
          </h2>
          <StartCountForm
            branches={branches.map((b) => ({
              id: b.id,
              code: b.code,
              name: b.name,
            }))}
          />
        </div>

        {/* รายการรอบการตรวจนับทั้งหมด */}
        <div className="lg:col-span-2 rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
          <h2 className="font-semibold text-lg border-b border-gray-100 pb-2">
            ประวัติรอบตรวจนับสต๊อก
          </h2>

          <div className="flex flex-col gap-4">
            {counts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                ไม่มีรอบตรวจนับสต๊อกในระบบ
              </p>
            ) : (
              counts.map((c) => {
                const totalExpected = c.items.filter(
                  (it) => it.expected,
                ).length;
                const totalFound = c.items.filter((it) => it.found).length;
                const totalMissing = c.items.filter(
                  (it) => it.expected && it.found === false,
                ).length;
                const totalUnexpected = c.items.filter(
                  (it) => !it.expected && it.found,
                ).length;

                return (
                  <div
                    key={c.id}
                    className="border border-gray-200 rounded p-4 flex flex-col gap-2 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm font-mono text-amber-900">
                          {c.docNo}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">
                          สาขา: {c.branch.name} ({c.branch.code})
                        </span>
                      </div>
                      <div>
                        <span
                          className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                            c.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : c.status === "REVIEW"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>

                    {/* สรุปตัวเลข */}
                    <div className="grid grid-cols-4 gap-2 text-xs font-mono bg-white p-2 rounded border border-gray-100 text-center my-1">
                      <div>
                        <p className="text-gray-500">คาดว่ามี</p>
                        <p className="font-bold text-sm text-gray-800">
                          {totalExpected}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">ตรวจพบ</p>
                        <p className="font-bold text-sm text-green-700">
                          {totalFound}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">สูญหาย</p>
                        <p className="font-bold text-sm text-red-600">
                          {totalMissing}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">เกินคลัง</p>
                        <p className="font-bold text-sm text-blue-600">
                          {totalUnexpected}
                        </p>
                      </div>
                    </div>

                    {c.note && (
                      <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                        หมายเหตุ: {c.note}
                      </p>
                    )}

                    {/* ปุ่มดำเนินการตรวจนับ */}
                    <div className="flex gap-2 justify-end border-t border-gray-200 pt-2 mt-2 flex-wrap items-center">
                      {c.status === "OPEN" && (
                        <>
                          <Link
                            href={`/admin/inventory/stock-counts/${c.id}`}
                            className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white text-center"
                          >
                            สแกนนับสินค้า
                          </Link>
                          <form
                            action={async () => {
                              "use server";
                              await submitReviewAction(c.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="rounded border border-gray-300 hover:bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
                            >
                              ส่งตรวจทาน (Review)
                            </button>
                          </form>
                        </>
                      )}

                      {c.status === "REVIEW" && (
                        <>
                          <Link
                            href={`/admin/inventory/stock-counts/${c.id}`}
                            className="rounded border border-gray-300 hover:bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 mr-auto text-center"
                          >
                            ดูสรุปการสแกน
                          </Link>
                          {canAdjust ? (
                            <ApproveStockForm countId={c.id} />
                          ) : (
                            <span className="text-xs text-red-600 italic">
                              ต้องการผู้ดูแลที่มีสิทธิ์ stock.adjust
                              เพื่อตรวจสอบ
                            </span>
                          )}
                        </>
                      )}

                      {c.status === "APPROVED" && (
                        <Link
                          href={`/admin/inventory/stock-counts/${c.id}`}
                          className="rounded border border-gray-300 hover:bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 text-center"
                        >
                          ดูรายละเอียดผลนับย้อนหลัง
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
