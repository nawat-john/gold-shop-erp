import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { getCurrentShopPrice } from "@/server/services/price-snapshot.service";
import {
  getNumberSetting,
  SETTING_KEYS,
} from "@/server/services/settings.service";
import { NewContractForm } from "./new-contract-form";

export const metadata = { title: "เปิดสัญญาขายฝากใหม่ — Gold Shop ERP" };

export default async function NewPawnContractPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.open");

  const [branches, locations, currentPrice, ltvPercent] = await Promise.all([
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
    prisma.storageLocation.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
    getCurrentShopPrice(prisma),
    getNumberSetting(prisma, SETTING_KEYS.pawnLoanToValuePercent, 80),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">เปิดสัญญาขายฝากใหม่</h1>
        <Link
          href="/admin/pawn"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้ารายการ
        </Link>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <NewContractForm
          branches={branches.map((b) => ({
            id: b.id,
            code: b.code,
            name: b.name,
          }))}
          locations={locations.map((l) => ({
            id: l.id,
            branchId: l.branchId,
            code: l.code,
            name: l.name,
          }))}
          ornamentBuyBaht={
            currentPrice
              ? Number(currentPrice.announcement.ornamentBuy) / 100
              : null
          }
          ltvPercent={ltvPercent}
        />
      </div>
    </div>
  );
}
