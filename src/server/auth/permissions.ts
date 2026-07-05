// Permission catalog — deny-by-default: endpoint ที่ไม่ประกาศ permission = ปฏิเสธ
// เพิ่ม permission ใหม่ที่นี่ที่เดียว แล้ว seed จะ upsert ให้อัตโนมัติ
// ตั้งชื่อ: <entity>.<action> เช่น "sale.void", "price.override"

export const PERMISSIONS = {
  // Phase 1 — Admin & Platform
  "user.manage": "สร้าง/แก้ไข/ปิดใช้งานผู้ใช้ และ reset รหัสผ่าน",
  "user.view": "ดูรายชื่อผู้ใช้",
  "role.manage": "จัดการบทบาทและสิทธิ์",
  "branch.manage": "สร้าง/แก้ไขสาขา",
  "settings.manage": "แก้ไขการตั้งค่าระบบ",
  "settings.view": "ดูการตั้งค่าระบบ",
  "audit.view": "ดู audit log",
  "session.revoke": "บังคับผู้ใช้ออกจากระบบ",

  // Phase 2 — Gold Price Engine
  "price.view": "ดูราคาทองและประวัติ",
  "price.announce": "ประกาศราคาหน้าร้าน / กรอกราคา feed มือ",

  // Phase 3 — Inventory
  "stock.view": "ดูรายการสินค้าและสต๊อกสินค้า",
  "stock.receive": "รับสินค้าเข้าจาก Supplier",
  "stock.transfer": "จัดการการโอนย้ายสินค้าข้ามสาขา",
  "stock.count": "สร้างและตรวจนับสต๊อกสินค้า",
  "stock.adjust": "ปรับปรุงยอดสต๊อกสินค้า (ต้องการ PIN ผู้อนุมัติ)",
  "stock.melt": "จัดการส่งทองเก่าหลอม/คืนโรงงาน",
} as const;

export type PermissionCode = keyof typeof PERMISSIONS;

export const ALL_PERMISSION_CODES = Object.keys(
  PERMISSIONS,
) as PermissionCode[];

/// บทบาทระบบตามแผน §1.2 — isSystem=true ห้ามลบ, สิทธิ์แก้ได้ผ่านหน้า role
export const SYSTEM_ROLES: Record<
  string,
  { name: string; description: string; permissions: PermissionCode[] }
> = {
  OWNER: {
    name: "เจ้าของร้าน",
    description: "เห็นทุกอย่างรวม audit log และตั้งค่าระบบ",
    permissions: ALL_PERMISSION_CODES,
  },
  ADMIN: {
    name: "ผู้ดูแลระบบ",
    description: "จัดการผู้ใช้/สิทธิ์/สาขา — ไม่เห็นข้อมูลการเงิน",
    permissions: [
      "user.manage",
      "user.view",
      "role.manage",
      "branch.manage",
      "settings.manage",
      "settings.view",
      "session.revoke",
    ],
  },
  BRANCH_MANAGER: {
    name: "ผู้จัดการสาขา",
    description:
      "บริหารสาขาตัวเอง อนุมัติรายการพิเศษ (สิทธิ์ POS มาใน Phase 4)",
    permissions: [
      "user.view",
      "settings.view",
      "price.view",
      "stock.view",
      "stock.receive",
      "stock.transfer",
      "stock.count",
      "stock.adjust",
      "stock.melt",
    ],
  },
  CASHIER: {
    name: "พนักงานขาย",
    description: "ซื้อ-ขายหน้าร้าน (สิทธิ์ POS มาใน Phase 4)",
    permissions: ["price.view", "stock.view", "stock.count"],
  },
  STOCK_KEEPER: {
    name: "พนักงานสต๊อก",
    description: "จัดการสต๊อก (สิทธิ์มาใน Phase 3)",
    permissions: [
      "price.view",
      "stock.view",
      "stock.receive",
      "stock.transfer",
      "stock.count",
      "stock.melt",
    ],
  },
  ACCOUNTANT: {
    name: "ฝ่ายบัญชี",
    description: "บัญชีและภาษี (สิทธิ์มาใน Phase 7)",
    permissions: ["audit.view", "price.view"],
  },
};
