import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  requirePermission,
  hasPermission,
} from "@/server/services/rbac.service";
import { getStatement } from "@/server/services/savings.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import { formatMgAsGrams } from "@/server/domain/gold";
import {
  DepositForm,
  CloseForGoldForm,
  CloseForCashForm,
  CloseDefaultedForm,
} from "./savings-forms";

export const metadata = { title: "รายละเอียดบัญชีออมทอง — Gold Shop ERP" };

export default async function SavingsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "savings.view");
  const canCancel = await hasPermission(
    prisma,
    session.user.id,
    "savings.cancel",
  );

  const account = await prisma.savingsAccount.findUnique({
    where: { id },
    include: { branch: true, customer: true },
  });
  if (!account) notFound();

  const statement = await getStatement(prisma, id);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">บัญชี {account.docNo}</h1>
        <Link
          href="/admin/savings"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้ารายการ
        </Link>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">ลูกค้า</p>
          <p className="font-semibold">
            {account.customer?.name ?? "ลูกค้าจร"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">สถานะ</p>
          <p className="font-semibold">{account.status}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ประเภทบัญชี</p>
          <p className="font-semibold">
            {account.accountType === "CASH_SAVINGS" ? "ออมเงิน" : "ออมน้ำหนัก"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ยอดสะสม</p>
          <p className="font-mono font-semibold">
            {account.accountType === "CASH_SAVINGS"
              ? `${formatSatangAsBaht(account.balanceSatang)} บาท`
              : `${formatMgAsGrams(account.balanceWeightMg)} กรัม`}
          </p>
        </div>
      </div>

      {account.status === "ACTIVE" && (
        <div className="rounded border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-sm border-b border-gray-100 pb-2">
            ดำเนินการ
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <DepositForm accountId={account.id} />
            <div className="flex flex-col gap-2">
              <CloseForGoldForm accountId={account.id} />
              <CloseForCashForm accountId={account.id} />
              {canCancel && <CloseDefaultedForm accountId={account.id} />}
            </div>
          </div>
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-sm border-b border-gray-100 pb-2 mb-3">
          รายการเดินบัญชี (Statement)
        </h2>
        <ul className="flex flex-col gap-2 text-xs">
          {statement.map((tx) => (
            <li
              key={tx.id.toString()}
              className="border-b border-gray-50 pb-2 flex justify-between"
            >
              <span className="font-semibold">{tx.txType}</span>
              <span className="font-mono text-right">
                {tx.amountSatang !== null &&
                  `${formatSatangAsBaht(tx.amountSatang)} บาท`}
                {tx.weightMg !== null &&
                  ` (${formatMgAsGrams(tx.weightMg)} กรัม)`}
                <br />
                <span className="text-gray-500">
                  {tx.createdAt.toLocaleString("th-TH")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
