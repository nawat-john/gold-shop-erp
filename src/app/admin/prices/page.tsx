import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  hasPermission,
  requirePermission,
} from "@/server/services/rbac.service";
import { formatSatangAsBaht } from "@/server/domain/money";
import {
  getLatestFeed,
  listRecentFeeds,
} from "@/server/services/price-feed.service";
import { listAnnouncementHistory } from "@/server/services/price-announcement.service";
import { getCurrentShopPrice } from "@/server/services/price-snapshot.service";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { AnnouncePriceForm, ManualFeedForm } from "./announce-form";
import { fetchFeedNowAction } from "./actions";

export const metadata = { title: "ราคาทอง — Gold Shop ERP" };

const fmtTime = (d: Date) =>
  d.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "short",
    timeStyle: "short",
  });

function satangToBahtInput(satang: bigint): string {
  return formatSatangAsBaht(satang).replace(/,/g, "");
}

export default async function PricesPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "price.view");
  const canAnnounce = await hasPermission(
    prisma,
    session.user.id,
    "price.announce",
  );

  const [current, latestFeed, feeds, announcements] = await Promise.all([
    getCurrentShopPrice(prisma),
    getLatestFeed(prisma),
    listRecentFeeds(prisma, 30),
    listAnnouncementHistory(prisma, 10),
  ]);

  const chartPoints = [...feeds].reverse().map((f) => ({
    t: f.announcedAt.toISOString(),
    satang: f.barSell.toString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">ราคาทอง</h1>

      {current?.feedStale && (
        <div
          role="alert"
          className="rounded border border-amber-400 bg-amber-50 p-4 text-sm"
        >
          ⚠ feed ราคาสมาคมไม่อัปเดต
          {current.latestFeedAt
            ? ` (ล่าสุด ${fmtTime(current.latestFeedAt)})`
            : " (ยังไม่เคยได้รับ)"}{" "}
          — ระบบยังขายได้ด้วยราคาประกาศล่าสุด ตรวจสอบ worker หรือกรอกราคามือ
        </div>
      )}

      <section className="rounded border border-gray-200 p-4">
        <h2 className="mb-2 font-semibold">ราคาประกาศปัจจุบันของร้าน</h2>
        {!current ? (
          <p className="text-red-600">
            ยังไม่เคยประกาศราคา — เปิดบิลไม่ได้จนกว่าจะประกาศ
          </p>
        ) : (
          <div className="grid max-w-lg grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <p>
              แท่ง รับซื้อ:{" "}
              <strong className="font-mono">
                {formatSatangAsBaht(current.announcement.barBuy)}
              </strong>
            </p>
            <p>
              แท่ง ขายออก:{" "}
              <strong className="font-mono">
                {formatSatangAsBaht(current.announcement.barSell)}
              </strong>
            </p>
            <p>
              รูปพรรณ รับซื้อ:{" "}
              <strong className="font-mono">
                {formatSatangAsBaht(current.announcement.ornamentBuy)}
              </strong>
            </p>
            <p>
              รูปพรรณ ขายออก:{" "}
              <strong className="font-mono">
                {formatSatangAsBaht(current.announcement.ornamentSell)}
              </strong>
            </p>
            <p className="col-span-2 text-xs text-gray-500">
              ประกาศเมื่อ {fmtTime(current.announcement.announcedAt)}
            </p>
          </div>
        )}
      </section>

      <PriceHistoryChart
        points={chartPoints}
        title="ราคาทองแท่งขายออก (บาท/บาททอง) — จาก feed ย้อนหลัง"
      />

      {canAnnounce && (
        <div className="flex flex-wrap gap-6">
          <AnnouncePriceForm
            defaults={
              latestFeed
                ? {
                    barBuy: satangToBahtInput(latestFeed.barBuy),
                    barSell: satangToBahtInput(latestFeed.barSell),
                    ornamentBuy: satangToBahtInput(latestFeed.ornamentBuy),
                    ornamentSell: satangToBahtInput(latestFeed.ornamentSell),
                  }
                : null
            }
            basedOnFeedId={latestFeed?.id ?? null}
          />
          <ManualFeedForm />
        </div>
      )}

      <section>
        <div className="mb-2 flex items-center gap-4">
          <h2 className="font-semibold">Feed ล่าสุด</h2>
          {canAnnounce && (
            <form action={fetchFeedNowAction}>
              <button
                type="submit"
                className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
              >
                ดึงราคาตอนนี้
              </button>
            </form>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 pr-4">เวลาประกาศ</th>
                <th className="py-2 pr-4">source</th>
                <th className="py-2 pr-4">แท่งรับซื้อ</th>
                <th className="py-2 pr-4">แท่งขายออก</th>
                <th className="py-2 pr-4">รูปพรรณรับซื้อ</th>
                <th className="py-2">รูปพรรณขายออก</th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((f) => (
                <tr key={f.id} className="border-b border-gray-100">
                  <td className="py-1.5 pr-4 text-xs">
                    {fmtTime(f.announcedAt)}
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-xs">{f.source}</td>
                  <td className="py-1.5 pr-4 font-mono">
                    {formatSatangAsBaht(f.barBuy)}
                  </td>
                  <td className="py-1.5 pr-4 font-mono">
                    {formatSatangAsBaht(f.barSell)}
                  </td>
                  <td className="py-1.5 pr-4 font-mono">
                    {formatSatangAsBaht(f.ornamentBuy)}
                  </td>
                  <td className="py-1.5 font-mono">
                    {formatSatangAsBaht(f.ornamentSell)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">ประวัติประกาศราคาร้าน</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 pr-4">เวลา</th>
                <th className="py-2 pr-4">แท่งรับซื้อ</th>
                <th className="py-2 pr-4">แท่งขายออก</th>
                <th className="py-2 pr-4">รูปพรรณรับซื้อ</th>
                <th className="py-2 pr-4">รูปพรรณขายออก</th>
                <th className="py-2">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id} className="border-b border-gray-100">
                  <td className="py-1.5 pr-4 text-xs">
                    {fmtTime(a.announcedAt)}
                  </td>
                  <td className="py-1.5 pr-4 font-mono">
                    {formatSatangAsBaht(a.barBuy)}
                  </td>
                  <td className="py-1.5 pr-4 font-mono">
                    {formatSatangAsBaht(a.barSell)}
                  </td>
                  <td className="py-1.5 pr-4 font-mono">
                    {formatSatangAsBaht(a.ornamentBuy)}
                  </td>
                  <td className="py-1.5 pr-4 font-mono">
                    {formatSatangAsBaht(a.ornamentSell)}
                  </td>
                  <td className="py-1.5 text-xs text-gray-600">
                    {a.note ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
