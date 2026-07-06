// ผังบัญชีมาตรฐาน (Chart of Accounts) — รหัสบัญชีอ้างอิงแบบ type-safe ทั้งระบบ
// เพิ่มบัญชีใหม่ที่นี่ที่เดียว แล้ว accounting-seed จะ upsert ให้อัตโนมัติ (เหมือน permissions.ts)
import type { AccountType } from "@/generated/prisma/client";

export const ACCOUNT_CODES = {
  cash: "1000",
  bank: "1010",
  inventoryGold: "1200",
  pawnLoansReceivable: "1300",
  vatPayable: "2000",
  customerDepositsSavings: "2100",
  customerDepositsWorkOrders: "2110",
  commissionPayable: "2200",
  ownersEquity: "3000",
  salesRevenueGold: "4000",
  salesRevenueLabor: "4010",
  interestIncomePawn: "4020",
  repairServiceIncome: "4030",
  savingsPriceGain: "4040",
  cogsGold: "5000",
  generalExpenses: "5100",
  commissionExpense: "5200",
  cardProcessingFee: "5300",
  savingsPriceLoss: "5400",
} as const;

export type AccountCode = (typeof ACCOUNT_CODES)[keyof typeof ACCOUNT_CODES];

export const CHART_OF_ACCOUNTS: {
  code: AccountCode;
  name: string;
  type: AccountType;
}[] = [
  { code: ACCOUNT_CODES.cash, name: "เงินสด", type: "ASSET" },
  { code: ACCOUNT_CODES.bank, name: "เงินฝากธนาคาร", type: "ASSET" },
  {
    code: ACCOUNT_CODES.inventoryGold,
    name: "สินค้าคงเหลือ-ทองคำ",
    type: "ASSET",
  },
  {
    code: ACCOUNT_CODES.pawnLoansReceivable,
    name: "ลูกหนี้เงินให้กู้ยืม-ขายฝาก",
    type: "ASSET",
  },
  {
    code: ACCOUNT_CODES.vatPayable,
    name: "ภาษีขายค้างจ่าย",
    type: "LIABILITY",
  },
  {
    code: ACCOUNT_CODES.customerDepositsSavings,
    name: "เงินรับฝากล่วงหน้า-ออมทอง",
    type: "LIABILITY",
  },
  {
    code: ACCOUNT_CODES.customerDepositsWorkOrders,
    name: "เงินมัดจำรับล่วงหน้า-งานช่าง",
    type: "LIABILITY",
  },
  {
    code: ACCOUNT_CODES.commissionPayable,
    name: "ค่าคอมมิชชั่นค้างจ่าย",
    type: "LIABILITY",
  },
  { code: ACCOUNT_CODES.ownersEquity, name: "ทุน/กำไรสะสม", type: "EQUITY" },
  {
    code: ACCOUNT_CODES.salesRevenueGold,
    name: "รายได้ขายทอง-เนื้อทอง",
    type: "REVENUE",
  },
  {
    code: ACCOUNT_CODES.salesRevenueLabor,
    name: "รายได้ค่ากำเหน็จ",
    type: "REVENUE",
  },
  {
    code: ACCOUNT_CODES.interestIncomePawn,
    name: "รายได้ดอกเบี้ยขายฝาก",
    type: "REVENUE",
  },
  {
    code: ACCOUNT_CODES.repairServiceIncome,
    name: "รายได้ค่าบริการซ่อม",
    type: "REVENUE",
  },
  {
    code: ACCOUNT_CODES.savingsPriceGain,
    name: "กำไรจากส่วนต่างราคาบัญชีออมทอง",
    type: "REVENUE",
  },
  { code: ACCOUNT_CODES.cogsGold, name: "ต้นทุนขายทอง", type: "EXPENSE" },
  {
    code: ACCOUNT_CODES.generalExpenses,
    name: "ค่าใช้จ่ายทั่วไป",
    type: "EXPENSE",
  },
  {
    code: ACCOUNT_CODES.commissionExpense,
    name: "ค่าคอมมิชชั่นพนักงาน",
    type: "EXPENSE",
  },
  {
    code: ACCOUNT_CODES.cardProcessingFee,
    name: "ค่าธรรมเนียมบัตรเครดิต",
    type: "EXPENSE",
  },
  {
    code: ACCOUNT_CODES.savingsPriceLoss,
    name: "ขาดทุนจากส่วนต่างราคาบัญชีออมทอง",
    type: "EXPENSE",
  },
];
