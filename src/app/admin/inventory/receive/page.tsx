import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { ReceiveForm } from "./receive-form";

export const metadata = { title: "รับสินค้าเข้าคลัง — Gold Shop ERP" };

export default async function ReceivePage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "stock.receive");

  const [products, branches, suppliers, locations] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { sku: "asc" },
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
    prisma.storageLocation.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
  ]);

  // จัดการข้อมูลส่งต่อไปที่ Client Form
  const productOptions = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    tracking: p.tracking,
    goldPurity: Number(p.goldPurity),
  }));

  const branchOptions = branches.map((b) => ({
    id: b.id,
    code: b.code,
    name: b.name,
  }));

  const supplierOptions = suppliers.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
  }));

  const locationOptions = locations.map((l) => ({
    id: l.id,
    code: l.code,
    name: l.name,
    branchId: l.branchId,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        รับสินค้าเข้าคลัง (Supplier Receipt)
      </h1>
      <ReceiveForm
        products={productOptions}
        branches={branchOptions}
        suppliers={supplierOptions}
        locations={locationOptions}
      />
    </div>
  );
}
