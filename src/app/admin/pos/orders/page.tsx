import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  requirePermission,
  hasPermission,
} from "@/server/services/rbac.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { formatMgAsGrams } from "@/server/domain/gold";
import { VoidOrderForm } from "./void-form";

export const metadata = { title: "ประวัติการขายและยกเลิกบิล — Gold Shop ERP" };

export default async function OrdersPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.view");

  // ค้นหาสาขาของผู้ใช้งานปัจจุบัน
  const userRole = await prisma.userBranchRole.findFirst({
    where: { userId: session.user.id },
    select: { branchId: true },
  });
  if (!userRole) {
    return (
      <div className="p-6 text-red-600">
        ข้อผิดพลาด: บัญชีผู้ใช้นี้ไม่ได้ผูกกับสาขาใดๆ
      </div>
    );
  }
  const branchId = userRole.branchId;

  // ดึงประวัติบิลขายและประวัติบิลรับซื้อคืน
  const [salesOrders, purchaseOrders] = await Promise.all([
    prisma.salesOrder.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
        payments: true,
        tradeIn: true,
      },
      take: 20,
    }),
    prisma.purchaseOrder.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
        payments: true,
        tradeIn: true,
      },
      take: 20,
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
        <h1 className="text-2xl font-bold">
          ประวัติการเปิดบิลหน้าร้าน (Ledger Bills)
        </h1>
        <div className="flex gap-2">
          <Link
            href="/admin/pos"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 bg-white"
          >
            กลับหน้า POS
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* คอลัมน์ซ้าย: บิลขายสินค้า (Sales Orders) */}
        <section className="rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
          <h2 className="font-bold text-lg border-b border-gray-100 pb-2 text-amber-950">
            ประวัติบิลขายสินค้า
          </h2>

          <div className="flex flex-col gap-4">
            {salesOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                ไม่มีบิลขายสินค้าในประวัติสาขานี้
              </p>
            ) : (
              salesOrders.map((o) => (
                <div
                  key={o.id}
                  className="border border-gray-200 rounded p-4 flex flex-col gap-2 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm font-mono text-amber-900">
                        {o.docNo}
                      </span>
                      {o.tradeIn && (
                        <span className="ml-2 bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          Trade-In: {o.tradeIn.docNo}
                        </span>
                      )}
                      <br />
                      <span className="text-[10px] text-gray-500 font-mono">
                        {o.createdAt.toLocaleString("th-TH")} | โดย{" "}
                        {o.createdBy}
                      </span>
                    </div>
                    <span
                      className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                        o.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>

                  {/* รายการขายย่อย */}
                  <div className="text-xs border-t border-gray-200 pt-2">
                    <ul className="list-disc pl-4 flex flex-col gap-0.5 text-gray-600">
                      {o.items.map((it) => (
                        <li key={it.id}>
                          {it.product.name} ({formatMgAsGrams(it.weightMg)}{" "}
                          กรัม) —{" "}
                          <span className="font-bold text-amber-900 font-mono">
                            {formatSatangAsBaht(it.totalAmountSatang)} บาท
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ข้อมูลชำระเงิน */}
                  <div className="text-[10px] text-gray-500 flex justify-between bg-white p-1.5 rounded border border-gray-100 font-mono">
                    <span>วิธีกรรมรับเงิน:</span>
                    <span>
                      {o.payments
                        .map(
                          (p) =>
                            `${p.paymentMethod} (${formatSatangAsBaht(p.amountSatang)})`,
                        )
                        .join(", ")}
                    </span>
                  </div>

                  {o.status === "VOIDED" && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 italic mt-1">
                      ยกเลิกบิลเมื่อ: {o.voidedAt?.toLocaleString("th-TH")} |
                      เหตุผล: {o.voidReason}
                    </p>
                  )}

                  {/* ปุ่ม Void ด้วย PIN ผู้อนุมัติ */}
                  {o.status === "COMPLETED" && (
                    <div className="flex justify-end pt-2 border-t border-gray-200 mt-2">
                      {canAdjust ? (
                        <VoidOrderForm
                          orderId={o.id}
                          orderType="SALES"
                          docNo={o.docNo}
                        />
                      ) : (
                        <span className="text-[10px] text-red-600 italic">
                          ต้องการสิทธิ์ตรวจสอบและอนุมัติด้วย PIN เพื่อ Void
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* คอลัมน์ขวา: บิลรับซื้อทองคำเก่า (Purchase Orders) */}
        <section className="rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
          <h2 className="font-bold text-lg border-b border-gray-100 pb-2 text-blue-950">
            ประวัติบิลรับซื้อทองเก่า
          </h2>

          <div className="flex flex-col gap-4">
            {purchaseOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                ไม่มีบิลรับซื้อทองคืนในประวัติสาขานี้
              </p>
            ) : (
              purchaseOrders.map((o) => (
                <div
                  key={o.id}
                  className="border border-gray-200 rounded p-4 flex flex-col gap-2 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm font-mono text-blue-900">
                        {o.docNo}
                      </span>
                      {o.tradeIn && (
                        <span className="ml-2 bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          Trade-In: {o.tradeIn.docNo}
                        </span>
                      )}
                      <br />
                      <span className="text-[10px] text-gray-500 font-mono">
                        {o.createdAt.toLocaleString("th-TH")} | โดย{" "}
                        {o.createdBy}
                      </span>
                    </div>
                    <span
                      className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                        o.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>

                  {/* รายการรับซื้อเก่า */}
                  <div className="text-xs border-t border-gray-200 pt-2">
                    <ul className="list-disc pl-4 flex flex-col gap-0.5 text-gray-600">
                      {o.items.map((it) => (
                        <li key={it.id}>
                          {it.description} ({formatMgAsGrams(it.weightMg)} กรัม)
                          —{" "}
                          <span className="font-bold text-blue-900 font-mono">
                            {formatSatangAsBaht(it.totalAmountSatang)} บาท
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ข้อมูลชำระเงิน */}
                  <div className="text-[10px] text-gray-500 flex justify-between bg-white p-1.5 rounded border border-gray-100 font-mono">
                    <span>วิธีกรรมจ่ายเงิน:</span>
                    <span>
                      {o.payments
                        .map(
                          (p) =>
                            `${p.paymentMethod} (${formatSatangAsBaht(p.amountSatang)})`,
                        )
                        .join(", ")}
                    </span>
                  </div>

                  {o.status === "VOIDED" && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 italic mt-1">
                      ยกเลิกบิลเมื่อ: {o.voidedAt?.toLocaleString("th-TH")} |
                      เหตุผล: {o.voidReason}
                    </p>
                  )}

                  {/* ปุ่ม Void บิลรับซื้อ */}
                  {o.status === "COMPLETED" && (
                    <div className="flex justify-end pt-2 border-t border-gray-200 mt-2">
                      {canAdjust ? (
                        <VoidOrderForm
                          orderId={o.id}
                          orderType="PURCHASE"
                          docNo={o.docNo}
                        />
                      ) : (
                        <span className="text-[10px] text-red-600 italic">
                          ต้องการสิทธิ์ตรวจสอบเพื่อ Void
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
