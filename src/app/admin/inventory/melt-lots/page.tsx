import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { formatMgAsGrams } from "@/server/domain/gold";
import { formatSatangAsBaht } from "@/server/domain/money";
import { MeltForm } from "./melt-form";
import { SendToMeltModal, CloseMeltLotModal } from "./actions-form";
import { cancelMeltLotAction } from "../actions";

export const metadata = { title: "การส่งหลอมทองคำ — Gold Shop ERP" };

export default async function MeltLotsPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.melt");

  const [lots, branches, inStockItems] = await Promise.all([
    prisma.meltLot.findMany({
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
    prisma.inventoryItem.findMany({
      where: {
        status: "IN_STOCK",
      },
      include: {
        product: true,
      },
    }),
  ]);

  // คัดกรองข้อมูลส่งต่อไปที่ Client Form
  const branchesList = branches.map((b) => ({
    id: b.id,
    code: b.code,
    name: b.name,
  }));

  const inStockItemsList = inStockItems.map((item) => ({
    id: item.id,
    serialNo: item.serialNo,
    weightMg: item.weightMg.toString(),
    branchId: item.branchId,
    productName: item.product.name,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ระบบส่งหลอมทองเก่า (Melt Lots)</h1>
        <Link
          href="/admin/inventory"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้าคลังสินค้า
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ฟอร์มเปิดรอบส่งหลอม */}
        <div className="lg:col-span-1">
          <MeltForm branches={branchesList} inStockItems={inStockItemsList} />
        </div>

        {/* รายการรอบหลอมทั้งหมด */}
        <div className="lg:col-span-2 rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
          <h2 className="font-semibold text-lg border-b border-gray-100 pb-2">
            ประวัติและรอบการส่งหลอม
          </h2>

          <div className="flex flex-col gap-4">
            {lots.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                ไม่มีข้อมูลรอบส่งหลอมในระบบ
              </p>
            ) : (
              lots.map((l) => {
                // คำนวณน้ำหนักตั้งต้นในรอบหลอม (รวมน้ำหนักของชิ้นสต๊อกดั้งเดิม)
                const originalWeightMg = l.items.reduce(
                  (sum, it) => sum + it.item.weightMg,
                  0n,
                );

                // คำนวณความสูญเสีย (Loss) หลังส่งหลอมจริง
                let lossPct = null;
                if (
                  l.status === "CLOSED" &&
                  l.sentWeightMg &&
                  l.returnedWeightMg
                ) {
                  const diff = l.sentWeightMg - l.returnedWeightMg;
                  lossPct = (Number(diff) / Number(l.sentWeightMg)) * 100;
                }

                return (
                  <div
                    key={l.id}
                    className="border border-gray-200 rounded p-4 flex flex-col gap-2 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm font-mono text-amber-900">
                          {l.docNo}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">
                          สาขา: {l.branch.name} ({l.branch.code})
                        </span>
                      </div>
                      <div>
                        <span
                          className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                            l.status === "CLOSED"
                              ? "bg-green-100 text-green-800"
                              : l.status === "SENT"
                                ? "bg-blue-100 text-blue-800"
                                : l.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {l.status}
                        </span>
                      </div>
                    </div>

                    {/* รายการทองชำรุด */}
                    <div className="text-xs border-t border-gray-200 pt-2 mt-1">
                      <p className="font-semibold mb-1 text-gray-600">
                        รายการทองส่งหลอม ({l.items.length}) — น้ำหนักรวมสินค้า:{" "}
                        <span className="font-mono">
                          {formatMgAsGrams(originalWeightMg)} กรัม
                        </span>
                        :
                      </p>
                      <ul className="list-disc pl-4 flex flex-col gap-0.5">
                        {l.items.map((it) => (
                          <li key={it.itemId}>
                            <span className="font-mono">
                              {it.item.serialNo}
                            </span>{" "}
                            — {it.item.product.name} (
                            {formatMgAsGrams(it.item.weightMg)} กรัม)
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* ข้อมูลการตรวจสอบผลต่างน้ำหนักและมูลค่าตลาดเมื่อ CLOSED */}
                    {l.status === "CLOSED" && (
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-white p-2 rounded border border-gray-100 text-center my-1">
                        <div>
                          <p className="text-gray-500 font-sans">
                            ส่งหลอมชั่งได้
                          </p>
                          <p className="font-bold text-sm text-gray-800">
                            {l.sentWeightMg
                              ? formatMgAsGrams(l.sentWeightMg)
                              : "—"}{" "}
                            กรัม
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-sans">
                            ได้รับเนื้อทองคืน
                          </p>
                          <p className="font-bold text-sm text-green-700">
                            {l.returnedWeightMg
                              ? formatMgAsGrams(l.returnedWeightMg)
                              : "—"}{" "}
                            กรัม
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-sans">
                            สูญเสีย (Loss)
                          </p>
                          <p className="font-bold text-sm text-red-600">
                            {lossPct !== null ? `${lossPct.toFixed(2)}%` : "—"}
                          </p>
                        </div>
                        <div className="col-span-3 text-left border-t border-gray-100 pt-1 mt-1 font-sans text-xs text-gray-600 flex justify-between">
                          <span>มูลค่าทองคืนรวม:</span>
                          <span className="font-bold font-mono">
                            {l.returnedSatang
                              ? formatSatangAsBaht(l.returnedSatang)
                              : "—"}{" "}
                            บาท
                          </span>
                        </div>
                      </div>
                    )}

                    {l.note && (
                      <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                        หมายเหตุ: {l.note}
                      </p>
                    )}

                    {/* ปุ่มเปลี่ยนสถานะ */}
                    <div className="flex gap-2 justify-end border-t border-gray-200 pt-2 mt-2">
                      {l.status === "OPEN" && (
                        <>
                          <SendToMeltModal lotId={l.id} />
                          <form
                            action={async () => {
                              "use server";
                              await cancelMeltLotAction(l.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="rounded bg-red-50 hover:bg-red-100 border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                          </form>
                        </>
                      )}

                      {l.status === "SENT" && (
                        <CloseMeltLotModal lotId={l.id} />
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
