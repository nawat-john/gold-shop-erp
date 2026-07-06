import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  requirePermission,
  hasPermission,
} from "@/server/services/rbac.service";
import {
  getCustomerTransactionHistory,
  maskCitizenId,
  decryptCitizenId,
} from "@/server/services/customer.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import {
  EditCustomerForm,
  ConsentToggle,
  AnonymizeForm,
} from "./customer-forms";

export const metadata = { title: "รายละเอียดลูกค้า — Gold Shop ERP" };

const TIER_LABEL: Record<string, string> = {
  BRONZE: "ทองแดง",
  SILVER: "เงิน",
  GOLD: "ทอง",
};

const TX_TYPE_LABEL: Record<string, string> = {
  SALE: "บิลขาย",
  PURCHASE: "บิลรับซื้อ",
  PAWN: "สัญญาขายฝาก",
  SAVINGS: "บัญชีออมทอง",
  WORK_ORDER: "ใบสั่งงานช่าง",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "customer.view");
  const canViewPii = await hasPermission(
    prisma,
    session.user.id,
    "customer.view_pii",
  );
  const canAnonymize = await hasPermission(
    prisma,
    session.user.id,
    "customer.anonymize",
  );

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  const history = await getCustomerTransactionHistory(prisma, id);

  let citizenIdDisplay: string | null = null;
  if (customer.citizenIdEnc) {
    const plain = decryptCitizenId(customer.citizenIdEnc);
    citizenIdDisplay = canViewPii ? plain : maskCitizenId(plain);
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{customer.code}</h1>
        <Link
          href="/admin/customers"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้ารายการ
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded border border-gray-200 bg-white p-6 flex flex-col gap-3">
          <h2 className="font-semibold text-sm border-b border-gray-100 pb-2">
            ข้อมูลลูกค้า
          </h2>
          <div className="text-sm grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">แต้มสะสม</p>
              <p className="font-semibold">
                {customer.loyaltyPoints.toLocaleString("th-TH")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ระดับ</p>
              <p className="font-semibold">{TIER_LABEL[customer.tier]}</p>
            </div>
            {citizenIdDisplay && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">เลขบัตรประชาชน</p>
                <p className="font-mono">{citizenIdDisplay}</p>
              </div>
            )}
          </div>

          {customer.anonymizedAt ? (
            <p className="text-xs text-gray-500 italic">
              ข้อมูลส่วนตัวถูกล้างแล้วเมื่อ{" "}
              {customer.anonymizedAt.toLocaleDateString("th-TH")}
            </p>
          ) : (
            <EditCustomerForm
              customerId={customer.id}
              name={customer.name}
              phone={customer.phone ?? ""}
              address={customer.address ?? ""}
              note={customer.note ?? ""}
              canViewPii={canViewPii}
            />
          )}

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
            <ConsentToggle
              customerId={customer.id}
              hasConsent={
                !!customer.consentGivenAt && !customer.consentWithdrawnAt
              }
            />
            {canAnonymize && !customer.anonymizedAt && (
              <AnonymizeForm customerId={customer.id} />
            )}
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-sm border-b border-gray-100 pb-2 mb-3">
            ประวัติธุรกรรมทุกโมดูล
          </h2>
          <ul className="flex flex-col gap-2 text-xs max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <li className="text-gray-500 text-center py-4">
                ยังไม่มีประวัติธุรกรรม
              </li>
            ) : (
              history.map((row) => (
                <li
                  key={`${row.type}-${row.docNo}`}
                  className="border-b border-gray-50 pb-2 flex justify-between"
                >
                  <span>
                    <span className="font-semibold">
                      {TX_TYPE_LABEL[row.type]}
                    </span>{" "}
                    <span className="font-mono text-gray-500">{row.docNo}</span>
                  </span>
                  <span className="text-right">
                    <span className="font-mono">
                      {formatSatangAsBaht(row.amountSatang)}
                    </span>{" "}
                    บาท
                    <br />
                    <span className="text-gray-500">
                      {row.date.toLocaleDateString("th-TH")} — {row.status}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
