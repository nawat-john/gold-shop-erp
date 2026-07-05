import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  requirePermission,
  hasPermission,
} from "@/server/services/rbac.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { ShiftReconcileForm } from "./reconcile-form";
import { OpenShiftForm } from "./open-shift-form";
import { CloseShiftForm } from "./close-shift-form";

export const metadata = {
  title: "การจัดการกะและลิ้นชักเงินสด — Gold Shop ERP",
};

export default async function ShiftsPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.view");

  // ดึงสาขาที่ผู้ใช้เข้าถึง หรือใช้สาขาแรกในระบบเพื่อเทส
  const userRole = await prisma.userBranchRole.findFirst({
    where: { userId: session.user.id },
    include: { branch: true },
  });
  if (!userRole) {
    return (
      <div className="p-6 text-red-600">
        ข้อผิดพลาด: บัญชีผู้ใช้นี้ไม่ได้ผูกกับสาขาใดๆ
      </div>
    );
  }
  const branchId = userRole.branchId;

  const [drawers, activeShift, recentShifts] = await Promise.all([
    prisma.cashDrawer.findMany({ where: { branchId, isActive: true } }),
    prisma.shift.findFirst({
      where: { branchId, status: "OPEN" },
      include: { drawer: true },
    }),
    prisma.shift.findMany({
      where: { branchId },
      orderBy: { openedAt: "desc" },
      take: 10,
      include: { drawer: true },
    }),
  ]);

  const canAdjust = await hasPermission(
    prisma,
    session.user.id,
    "stock.adjust",
  );

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          จัดการกะพนักงานและลิ้นชักเงินสด (Shifts)
        </h1>
        <Link
          href="/admin/pos"
          className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          เข้าสู่หน้าจอ POS
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* จัดการสถานะกะปัจจุบัน */}
        <section className="rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
          <h2 className="font-bold text-lg border-b border-gray-100 pb-2">
            สถานะกะทำงานปัจจุบัน
          </h2>

          {activeShift ? (
            <div className="flex flex-col gap-4">
              <div className="bg-green-50 text-green-800 p-3 rounded border border-green-200 text-sm">
                ● <strong>เปิดกะอยู่:</strong> กำลังทำธุรกรรมที่ลิ้นชัก{" "}
                <strong>
                  {activeShift.drawer.name} ({activeShift.drawer.code})
                </strong>
                <br />
                <span className="text-xs text-gray-500 font-mono">
                  เริ่มกะ: {activeShift.openedAt.toLocaleString("th-TH")}
                </span>
              </div>

              <div className="text-sm">
                <span className="text-gray-500">เงินสดเริ่มต้นกะ:</span>{" "}
                <span className="font-bold font-mono">
                  {formatSatangAsBaht(activeShift.startCashSatang)} บาท
                </span>
              </div>

              {/* ฟอร์มปิดกะ */}
              <CloseShiftForm shiftId={activeShift.id} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100 text-gray-700 p-3 rounded text-sm italic text-center">
                ยังไม่มีการเปิดกะพนักงานขายในระบบขณะนี้
              </div>

              {/* ฟอร์มเปิดกะ */}
              <OpenShiftForm
                drawers={drawers.map((d) => ({
                  id: d.id,
                  code: d.code,
                  name: d.name,
                }))}
              />
            </div>
          )}
        </section>

        {/* ประวัติกะการทำงาน 10 รายการล่าสุด */}
        <section className="rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
          <h2 className="font-bold text-lg border-b border-gray-100 pb-2">
            ประวัติกะที่เพิ่งผ่านมา
          </h2>

          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
            {recentShifts.map((s) => (
              <div
                key={s.id}
                className="border border-gray-200 rounded p-3 text-xs bg-gray-50 flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{s.drawer.name}</span>
                    <br />
                    <span className="text-[10px] text-gray-500 font-mono">
                      {s.openedAt.toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 font-bold ${
                      s.status === "RECONCILED"
                        ? "bg-green-100 text-green-800"
                        : s.status === "CLOSED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 font-mono text-[10px] bg-white p-1.5 rounded border border-gray-100 mt-1 text-center">
                  <div>
                    <p className="text-gray-400">เงินตั้งต้น</p>
                    <p className="font-semibold">
                      {formatSatangAsBaht(s.startCashSatang)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">นับจริงเมื่อปิด</p>
                    <p className="font-semibold">
                      {s.endCashSatang
                        ? formatSatangAsBaht(s.endCashSatang)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">ระบบคาดว่ามี</p>
                    <p className="font-semibold text-amber-700">
                      {s.expectedCashSatang
                        ? formatSatangAsBaht(s.expectedCashSatang)
                        : "—"}
                    </p>
                  </div>
                </div>

                {s.status === "CLOSED" && (
                  <div className="flex justify-end pt-2 border-t border-gray-200 mt-1">
                    {canAdjust ? (
                      <ShiftReconcileForm shiftId={s.id} />
                    ) : (
                      <span className="text-[10px] text-red-600 italic">
                        ต้องการสิทธิ์ตรวจสอบเพื่อ Reconcile
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
