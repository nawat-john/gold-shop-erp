import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import {
  getNumberSetting,
  SETTING_KEYS,
} from "@/server/services/settings.service";
import { formatMgAsGrams } from "@/server/domain/gold";
import { formatSatangAsBaht } from "@/server/domain/money";
import { calculateAccruedInterest } from "@/server/domain/pawn-interest";
import {
  RenewInterestForm,
  RedeemForm,
  AdjustPrincipalForm,
  ForfeitForm,
  CancelForm,
} from "./contract-forms";

export const metadata = { title: "รายละเอียดสัญญาขายฝาก — Gold Shop ERP" };

export default async function PawnContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.view");

  const contract = await prisma.pawnContract.findUnique({
    where: { id },
    include: {
      branch: true,
      location: true,
      events: { orderBy: { createdAt: "desc" } },
      interestPayments: { orderBy: { paidAt: "desc" } },
    },
  });
  if (!contract) notFound();

  const now = new Date();
  const accruedInterest =
    contract.status === "ACTIVE"
      ? calculateAccruedInterest({
          principalSatang: contract.principalSatang,
          annualRatePercent: Number(contract.annualInterestRatePercent),
          fromDate: contract.interestPaidThroughDate,
          toDate: now,
        })
      : 0n;
  const totalPayable = contract.principalSatang + accruedInterest;

  const graceDays = await getNumberSetting(
    prisma,
    SETTING_KEYS.pawnForfeitGraceDays,
    7,
  );
  const forfeitEligibleAt = new Date(
    contract.dueDate.getTime() + graceDays * 86_400_000,
  );
  const canForfeit =
    contract.status === "ACTIVE" &&
    now.getTime() >= forfeitEligibleAt.getTime();
  const canCancel =
    contract.status === "ACTIVE" &&
    contract.interestPaidThroughDate.getTime() === contract.startDate.getTime();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">สัญญา {contract.docNo}</h1>
        <Link
          href="/admin/pawn"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้ารายการ
        </Link>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">ลูกค้า</p>
          <p className="font-semibold">{contract.customerName}</p>
          {contract.customerPhone && (
            <p className="text-xs text-gray-500">{contract.customerPhone}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500">สถานะ</p>
          <p className="font-semibold">{contract.status}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ทรัพย์</p>
          <p className="font-semibold">{contract.description}</p>
          <p className="text-xs text-gray-500">
            {formatMgAsGrams(contract.weightMg)} กรัม /{" "}
            {Number(contract.goldPurity)}%
            {contract.location && ` — ${contract.location.name}`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">สาขา</p>
          <p className="font-semibold">{contract.branch.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">เงินต้นปัจจุบัน</p>
          <p className="font-mono font-semibold">
            {formatSatangAsBaht(contract.principalSatang)} บาท
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">อัตราดอกเบี้ย</p>
          <p className="font-semibold">
            {Number(contract.annualInterestRatePercent)}%/ปี
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">วันเปิดสัญญา</p>
          <p>{contract.startDate.toLocaleDateString("th-TH")}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ครบกำหนดไถ่ถอน</p>
          <p>{contract.dueDate.toLocaleDateString("th-TH")}</p>
        </div>
        {contract.status === "ACTIVE" && (
          <>
            <div>
              <p className="text-xs text-gray-500">
                ดอกเบี้ยค้างโดยประมาณวันนี้
              </p>
              <p className="font-mono font-semibold text-amber-700">
                {formatSatangAsBaht(accruedInterest)} บาท
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                ยอดไถ่ถอนรวมโดยประมาณวันนี้
              </p>
              <p className="font-mono font-semibold text-amber-700">
                {formatSatangAsBaht(totalPayable)} บาท
              </p>
            </div>
          </>
        )}
      </div>

      {contract.status === "ACTIVE" && (
        <div className="rounded border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-lg border-b border-gray-100 pb-2">
            ดำเนินการ
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <RenewInterestForm contractId={contract.id} />
            <RedeemForm contractId={contract.id} />
            <AdjustPrincipalForm contractId={contract.id} />
            {canForfeit && <ForfeitForm contractId={contract.id} />}
            {canCancel && <CancelForm contractId={contract.id} />}
          </div>
          {!canForfeit && (
            <p className="text-xs text-gray-500">
              อนุมัติทองหลุดได้เมื่อพ้นระยะผ่อนผัน {graceDays} วันหลังครบกำหนด (
              {forfeitEligibleAt.toLocaleDateString("th-TH")})
            </p>
          )}
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-lg border-b border-gray-100 pb-2 mb-3">
          ประวัติเหตุการณ์
        </h2>
        <ul className="flex flex-col gap-2 text-xs">
          {contract.events.map((e) => (
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
