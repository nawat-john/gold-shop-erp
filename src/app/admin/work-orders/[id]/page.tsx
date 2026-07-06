import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  requirePermission,
  hasPermission,
} from "@/server/services/rbac.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { formatMgAsGrams } from "@/server/domain/gold";
import {
  IssueGoldForm,
  StartWorkForm,
  CompleteWorkOrderForm,
  DeliverWorkOrderForm,
  CancelWorkOrderForm,
} from "./work-order-forms";

export const metadata = { title: "รายละเอียดใบสั่งงาน — Gold Shop ERP" };

const TYPE_LABEL: Record<string, string> = {
  CUSTOM_ORDER: "สั่งทำ",
  REPAIR: "ซ่อม",
};

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "workorder.view");
  const canManage = await hasPermission(
    prisma,
    session.user.id,
    "workorder.manage",
  );
  const canCancel = await hasPermission(
    prisma,
    session.user.id,
    "workorder.cancel",
  );

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      branch: true,
      customer: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!workOrder) notFound();

  const canCancelNow =
    canCancel &&
    (workOrder.status === "RECEIVED" || workOrder.status === "IN_PROGRESS");

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ใบสั่งงาน {workOrder.docNo}</h1>
        <Link
          href="/admin/work-orders"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้าคิวงาน
        </Link>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">ประเภทงาน</p>
          <p className="font-semibold">{TYPE_LABEL[workOrder.type]}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">สถานะ</p>
          <p className="font-semibold">{workOrder.status}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">รายละเอียด</p>
          <p className="font-semibold">{workOrder.description}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">เงินมัดจำ</p>
          <p className="font-mono">
            {formatSatangAsBaht(workOrder.depositSatang)} บาท
          </p>
        </div>
        {workOrder.type === "CUSTOM_ORDER" ? (
          <div>
            <p className="text-xs text-gray-500">ทองที่เบิกช่างสะสม</p>
            <p className="font-mono">
              {formatMgAsGrams(workOrder.goldIssuedMg)} กรัม (เผื่อเศษ{" "}
              {formatMgAsGrams(workOrder.toleranceMg)} กรัม)
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500">ค่าบริการซ่อม</p>
            <p className="font-mono">
              {formatSatangAsBaht(workOrder.serviceFeeSatang)} บาท
            </p>
          </div>
        )}
      </div>

      {canManage &&
        (workOrder.status === "RECEIVED" ||
          workOrder.status === "IN_PROGRESS") && (
          <div className="rounded border border-gray-200 bg-white p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-sm border-b border-gray-100 pb-2">
              ดำเนินการ
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {workOrder.status === "RECEIVED" &&
                workOrder.type === "REPAIR" && (
                  <StartWorkForm workOrderId={workOrder.id} />
                )}
              {workOrder.type === "CUSTOM_ORDER" && (
                <IssueGoldForm workOrderId={workOrder.id} />
              )}
              {workOrder.status === "IN_PROGRESS" && (
                <CompleteWorkOrderForm workOrderId={workOrder.id} />
              )}
              {canCancelNow && (
                <CancelWorkOrderForm workOrderId={workOrder.id} />
              )}
            </div>
          </div>
        )}

      {canManage && workOrder.status === "COMPLETED" && (
        <div className="rounded border border-gray-200 bg-white p-6">
          <DeliverWorkOrderForm workOrderId={workOrder.id} />
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-sm border-b border-gray-100 pb-2 mb-3">
          ประวัติเหตุการณ์
        </h2>
        <ul className="flex flex-col gap-2 text-xs">
          {workOrder.events.map((e) => (
            <li
              key={e.id.toString()}
              className="border-b border-gray-50 pb-2 flex justify-between"
            >
              <span>
                <span className="font-semibold">{e.eventType}</span>{" "}
                {e.note && <span className="text-gray-500">— {e.note}</span>}
              </span>
              <span className="text-gray-500 font-mono">
                {e.createdAt.toLocaleString("th-TH")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
