import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { CashTransferForm } from "./cash-transfer-form";
import { SendCashTransferForm } from "./send-approval-form";
import { receiveCashTransferAction, cancelCashTransferAction } from "./actions";

export const metadata = { title: "โอนเงินสดข้ามสาขา — Gold Shop ERP" };

export default async function CashTransfersPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "cash.transfer");

  const [transfers, branches, drawers] = await Promise.all([
    prisma.cashTransfer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        fromBranch: true,
        toBranch: true,
        fromDrawer: true,
        toDrawer: true,
      },
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
    prisma.cashDrawer.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
  ]);

  const branchesList = branches.map((b) => ({
    id: b.id,
    code: b.code,
    name: b.name,
  }));
  const drawersList = drawers.map((d) => ({
    id: d.id,
    code: d.code,
    name: d.name,
    branchId: d.branchId,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          โอนเงินสดข้ามสาขา (Cash Transfer)
        </h1>
        <Link
          href="/admin/accounting"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้าบัญชี
        </Link>
      </div>

      <p className="text-xs text-gray-500 italic max-w-3xl">
        หมายเหตุ: การโอนเงินสดระหว่างสาขาไม่ลงบัญชี (GL) เพราะผังบัญชีมีบัญชี
        &quot;เงินสด&quot; ใบเดียวรวมทุกสาขา —
        การย้ายเงินระหว่างลิ้นชักไม่ทำให้เงินสดรวมของบริษัทเปลี่ยนแปลง
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <CashTransferForm branches={branchesList} drawers={drawersList} />
        </div>

        <div className="lg:col-span-2 rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
          <h2 className="font-semibold text-lg border-b border-gray-100 pb-2">
            ประวัติและสถานะใบโอนเงินสด
          </h2>

          <div className="flex flex-col gap-4">
            {transfers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                ไม่มีใบโอนเงินสดในระบบ
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
                        {t.fromBranch.name} ({t.fromBranch.code})
                        {t.fromDrawer ? ` [${t.fromDrawer.code}]` : ""} &rarr;{" "}
                        {t.toBranch.name} ({t.toBranch.code})
                        {t.toDrawer ? ` [${t.toDrawer.code}]` : ""}
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

                  <div className="text-sm font-mono font-semibold text-right">
                    {formatSatangAsBaht(t.amountSatang)}
                  </div>

                  {t.note && (
                    <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                      หมายเหตุ: {t.note}
                    </p>
                  )}

                  <div className="flex gap-2 justify-end border-t border-gray-200 pt-2 mt-2">
                    {t.status === "DRAFT" && (
                      <>
                        <SendCashTransferForm transferId={t.id} />
                        <form
                          action={async () => {
                            "use server";
                            await cancelCashTransferAction(t.id);
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
                            await receiveCashTransferAction(t.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded bg-green-600 hover:bg-green-700 px-3 py-1.5 text-xs font-bold text-white"
                          >
                            ยืนยันการรับเงิน
                          </button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await cancelCashTransferAction(t.id);
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
