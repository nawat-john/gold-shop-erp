import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { getCurrentAnnouncement } from "@/server/services/price-announcement.service";
import { POSClient } from "@/app/admin/pos/pos-client";

export const metadata = { title: "จุดขายและเปิดบิล — Gold Shop ERP" };

export default async function POSPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.view");

  // ค้นหาสาขาที่ผู้ใช้สังกัดอยู่
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

  // ตรวจสอบว่ากะของสาขานี้เปิดอยู่หรือไม่
  const activeShift = await prisma.shift.findFirst({
    where: { branchId, status: "OPEN" },
  });

  if (!activeShift) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-300 rounded max-w-lg mx-auto bg-gray-50 gap-4 mt-8">
        <h2 className="text-lg font-bold text-gray-800">
          ลิ้นชักเงินสดยังไม่เปิดทำการ
        </h2>
        <p className="text-sm text-gray-500 text-center">
          ระบบหน้าร้าน (POS)
          กำหนดให้พนักงานขายต้องเปิดกะและบันทึกยอดเงินสดตั้งต้นก่อนเริ่มขายสินค้า
        </p>
        <Link
          href="/admin/pos/shifts"
          className="rounded bg-amber-600 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          ไปที่หน้าจัดการกะพนักงาน
        </Link>
      </div>
    );
  }

  // ดึงราคาประกาศของร้านปัจจุบัน
  const announcement = await getCurrentAnnouncement(prisma);
  if (!announcement) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-300 rounded max-w-lg mx-auto bg-gray-50 gap-4 mt-8">
        <h2 className="text-lg font-bold text-gray-800">
          ยังไม่ได้ประกาศราคาทองคำ
        </h2>
        <p className="text-sm text-gray-500 text-center">
          กรุณาเข้าสู่ส่วนจัดการราคาและระบุราคาขายออก/รับซื้อคืนก่อนเปิดบิลหน้าร้าน
        </p>
        <Link
          href="/admin/prices"
          className="rounded bg-gray-800 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-900"
        >
          ไปที่หน้าประกาศราคาทองคำ
        </Link>
      </div>
    );
  }

  // ดึงสินค้าคลังทั้งหมดที่พร้อมขายในสาขานี้ และแบบสินค้า Master Data
  const [inStockItems, products] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: { branchId, status: "IN_STOCK" },
      include: { product: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { sku: "asc" },
    }),
  ]);

  // คัดกรองข้อมูลส่งต่อไปที่ POS Client Component
  const inStockItemsList = inStockItems.map((item) => ({
    id: item.id,
    serialNo: item.serialNo,
    productId: item.productId,
    productName: item.product.name,
    sku: item.product.sku,
    weightMg: item.weightMg.toString(),
    goldPurity: Number(item.goldPurity),
    laborChargeSatang: item.laborCharge ? item.laborCharge.toString() : "0",
  }));

  const productsList = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    tracking: p.tracking as "SERIALIZED" | "COUNTED",
    goldPurity: Number(p.goldPurity),
    stdWeightMg: p.stdWeightMg ? p.stdWeightMg.toString() : null,
  }));

  const priceAnn = {
    barBuy: announcement.barBuy.toString(),
    barSell: announcement.barSell.toString(),
    ornamentBuy: announcement.ornamentBuy.toString(),
    ornamentSell: announcement.ornamentSell.toString(),
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">POS จุดขายหน้าร้าน</h1>
        <div className="flex gap-2 text-xs">
          <Link
            href="/admin/pos/orders"
            className="rounded border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
          >
            ประวัติการขาย / Void บิล
          </Link>
          <Link
            href="/admin/pos/shifts"
            className="rounded border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
          >
            กะลิ้นชักเงินสด
          </Link>
        </div>
      </div>

      <POSClient
        branchId={branchId}
        shiftId={activeShift.id}
        inStockItems={inStockItemsList}
        products={productsList}
        priceAnnouncement={priceAnn}
      />
    </div>
  );
}
