// Price board — จอทีวีหน้าร้าน (route สาธารณะภายในร้าน, auto-refresh ทุก 15 วิ)
// ถ้าตั้ง setting `price_board.token` ไว้ ต้องเปิดด้วย ?token=<ค่า> เท่านั้น
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { formatSatangAsBaht } from "@/server/domain/money";
import { getCurrentShopPrice } from "@/server/services/price-snapshot.service";
import {
  SETTING_KEYS,
  getStringSetting,
} from "@/server/services/settings.service";
import { AutoRefresh } from "./auto-refresh";

export const metadata = { title: "ราคาทองวันนี้" };
export const dynamic = "force-dynamic";

export default async function PriceBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const requiredToken = await getStringSetting(
    prisma,
    SETTING_KEYS.priceBoardToken,
    "",
  );
  if (requiredToken) {
    const { token } = await searchParams;
    if (token !== requiredToken) notFound();
  }

  const current = await getCurrentShopPrice(prisma);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gray-950 p-8 text-white">
      <AutoRefresh />
      <h1 className="text-4xl font-bold tracking-wide text-amber-400">
        ราคาทองวันนี้
      </h1>

      {!current ? (
        <p className="text-2xl text-gray-400">รอประกาศราคา</p>
      ) : (
        <>
          <div className="grid w-full max-w-4xl grid-cols-2 gap-6">
            <PriceCard
              title="ทองคำแท่ง 96.5%"
              buy={current.announcement.barBuy}
              sell={current.announcement.barSell}
            />
            <PriceCard
              title="ทองรูปพรรณ 96.5%"
              buy={current.announcement.ornamentBuy}
              sell={current.announcement.ornamentSell}
            />
          </div>
          <p className="text-lg text-gray-400">
            ประกาศเมื่อ{" "}
            {current.announcement.announcedAt.toLocaleString("th-TH", {
              timeZone: "Asia/Bangkok",
              dateStyle: "long",
              timeStyle: "short",
            })}{" "}
            น.
          </p>
          {current.feedStale && (
            <p className="rounded bg-amber-900/60 px-4 py-2 text-sm text-amber-200">
              ราคาอ้างอิงสมาคมอาจไม่เป็นปัจจุบัน
            </p>
          )}
        </>
      )}
    </main>
  );
}

function PriceCard({
  title,
  buy,
  sell,
}: {
  title: string;
  buy: bigint;
  sell: bigint;
}) {
  return (
    <section className="rounded-2xl border border-amber-500/40 bg-gray-900 p-8">
      <h2 className="mb-6 text-center text-2xl font-semibold text-amber-300">
        {title}
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xl text-gray-300">รับซื้อ</span>
          <span className="font-mono text-5xl font-bold tabular-nums">
            {formatSatangAsBaht(buy)}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl text-gray-300">ขายออก</span>
          <span className="font-mono text-5xl font-bold tabular-nums text-amber-300">
            {formatSatangAsBaht(sell)}
          </span>
        </div>
      </div>
    </section>
  );
}
