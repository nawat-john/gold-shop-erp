import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { exportAlertsCsv } from "@/server/services/amlo.service";

/** ดาวน์โหลด CSV รายการแจ้งเตือน AMLO ย้อนหลัง 90 วัน — ใช้ส่งรายงานตามกฎหมาย */
export async function GET() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "amlo.manage");

  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - 90 * 86_400_000);
  const csv = await exportAlertsCsv(prisma, { fromDate, toDate });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amlo-alerts-${toDate.toISOString().slice(0, 10)}.csv"`,
    },
  });
}
