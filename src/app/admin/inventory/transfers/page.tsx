import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { TransferForm } from "./transfer-form";
import {
  sendTransferAction,
  receiveTransferAction,
  cancelTransferAction,
} from "../actions";

export const metadata = { title: "การโอนย้ายสาขา — Gold Shop ERP" };

export default async function TransfersPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.transfer");

  const [transfers, branches, inStockItems] = await Promise.all([
    prisma.branchTransfer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        fromBranch: true,
        toBranch: true,
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
      where: { status: "IN_STOCK" },
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
        <h1 className="text-2xl font-bold">
          โอนย้ายสินค้าข้ามสาขา (Branch Transfer)
        </h1>
        <Link
          href="/admin/inventory"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้าคลังสินค้า
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ฟอร์มการสร้างใบโอนย้าย */}
        <div className="lg:col-span-1">
          <TransferForm
            branches={branchesList}
            inStockItems={inStockItemsList}
          />
        </div>

        {/* รายการใบโอนย้ายทั้งหมด */}
        <div className="lg:col-span-2 rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
          <h2 className="font-semibold text-lg border-b border-gray-100 pb-2">
            ประวัติและสถานะใบโอนย้าย
          </h2>

          <div className="flex flex-col gap-4">
            {transfers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                ไม่มีใบโอนย้ายสินค้าในระบบ
              </p>
            ) : (
              transfers.map((t) => (
                <div
                  key={t.id}
                  className="border border-gray-200 rounded p-4 flex flex-col gap-2 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm font-mono text-amber-900">
                        {t.docNo}
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">
                        {t.fromBranch.name} ({t.fromBranch.code}) &rarr;{" "}
                        {t.toBranch.name} ({t.toBranch.code})
                      </span>
                    </div>
                    <div>
                      <span
                        className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                          t.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : t.status === "IN_TRANSIT"
                              ? "bg-blue-100 text-blue-800"
                              : t.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* สินค้าในใบโอน */}
                  <div className="text-xs border-t border-gray-200 pt-2 mt-1">
                    <p className="font-semibold mb-1 text-gray-600">
                      รายการสินค้า ({t.items.length}):
                    </p>
                    <ul className="list-disc pl-4 flex flex-col gap-0.5">
                      {t.items.map((it) => (
                        <li key={it.itemId}>
                          <span className="font-mono">{it.item.serialNo}</span>{" "}
                          — {it.item.product.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {t.note && (
                    <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                      หมายเหตุ: {t.note}
                    </p>
                  )}

                  {/* ปุ่มเปลี่ยนสถานะ */}
                  <div className="flex gap-2 justify-end border-t border-gray-200 pt-2 mt-2">
                    {t.status === "DRAFT" && (
                      <>
                        <form
                          action={async () => {
                            "use server";
                            await sendTransferAction(t.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white"
                          >
                            ยืนยันการส่งของ
                          </button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await cancelTransferAction(t.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded bg-red-50 hover:bg-red-100 border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700"
                          >
                            ยกเลิก
                          </button>
                        </form>
                      </>
                    )}

                    {t.status === "IN_TRANSIT" && (
                      <>
                        <form
                          action={async () => {
                            "use server";
                            await receiveTransferAction(t.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded bg-green-600 hover:bg-green-700 px-3 py-1.5 text-xs font-bold text-white"
                          >
                            ยืนยันการรับของ
                          </button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await cancelTransferAction(t.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded bg-red-50 hover:bg-red-100 border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700"
                          >
                            ตีกลับ/ยกเลิก
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
