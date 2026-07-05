"use client";

import { useState } from "react";
import {
  createSalesOrderAction,
  createPurchaseOrderAction,
  createTradeInAction,
} from "./actions";
import { formatSatangAsBaht } from "@/server/domain/money";
import { mgFromGramString } from "@/server/domain/gold";

type PaymentMethod = "CASH" | "TRANSFER" | "CREDIT_CARD";
const PaymentMethod = {
  CASH: "CASH" as const,
  TRANSFER: "TRANSFER" as const,
  CREDIT_CARD: "CREDIT_CARD" as const,
};

interface InStockItem {
  id: string;
  serialNo: string;
  productId: string;
  productName: string;
  sku: string;
  weightMg: string;
  goldPurity: number;
  laborChargeSatang: string;
}

interface ProductOption {
  id: string;
  sku: string;
  name: string;
  tracking: "SERIALIZED" | "COUNTED";
  goldPurity: number;
  stdWeightMg: string | null;
}

interface PriceAnnouncement {
  barBuy: string;
  barSell: string;
  ornamentBuy: string;
  ornamentSell: string;
}

interface POSClientProps {
  branchId: string;
  shiftId: string;
  inStockItems: InStockItem[];
  products: ProductOption[];
  priceAnnouncement: PriceAnnouncement;
}

interface CartItem {
  productId: string;
  itemId?: string | null; // สำหรับ Serialized
  serialNo?: string;
  name: string;
  sku: string;
  weightGramStr: string;
  goldPurity: number;
  laborChargeBahtStr: string;
  tracking: "SERIALIZED" | "COUNTED";
  quantity: number;
}

interface PurchaseCartItem {
  productId?: string | null;
  description: string;
  weightGramStr: string;
  goldPurity: number;
  unitPriceBahtStr: string; // ราคารับซื้อคืนต่อบาททองคำ
  totalBahtStr: string; // มูลค่ารับซื้อที่ตกลงกันจริงต่อชิ้น
}

export function POSClient({
  branchId,
  shiftId,
  inStockItems,
  products,
  priceAnnouncement,
}: POSClientProps) {
  // โหมดของ POS: SALE = ขาย, BUY = ซื้อคืน, TRADE = แลกเปลี่ยน
  const [posMode, setPosMode] = useState<"SALE" | "BUY" | "TRADE">("SALE");

  // ข้อมูลลูกค้า
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // ช่องค้นหาบาร์โค้ด / SKU
  const [searchQuery, setSearchQuery] = useState("");

  // ตะกร้าสินค้าขาขายออก (SALE)
  const [saleCart, setSaleCart] = useState<CartItem[]>([]);

  // ตะกร้าสินค้าขาซื้อเข้า (BUY)
  const [purchaseCart, setPurchaseCart] = useState<PurchaseCartItem[]>([]);

  // รายการชำระเงิน
  const [cashPayBaht, setCashPayBaht] = useState("");
  const [transferPayBaht, setTransferPayBaht] = useState("");
  const [creditPayBaht, setCreditPayBaht] = useState("");
  const [transferRef, setTransferRef] = useState("");

  // สถานะโหลดและการส่งผลลัพธ์
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [lastBillNo, setLastBillNo] = useState("");

  // ราคาขายสมาคมปัจจุบัน (สตางค์)
  const prices = {
    barBuy: BigInt(priceAnnouncement.barBuy),
    barSell: BigInt(priceAnnouncement.barSell),
    ornamentBuy: BigInt(priceAnnouncement.ornamentBuy),
    ornamentSell: BigInt(priceAnnouncement.ornamentSell),
  };

  // ดึงอัตราส่วนน้ำหนัก 1 บาททอง (มก.)
  const MG_PER_BAHT_ORNAMENT = 15160n;
  const MG_PER_BAHT_BAR = 15244n;

  // ค้นหาและสแกนสินค้าลงตะกร้า (สแกนบาร์โค้ดจะดึง SerialNo ทันที)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (posMode === "SALE" || posMode === "TRADE") {
      // 1) ค้นหาจากสินค้า Serialized ที่อยู่ในคลัง (InStock)
      const foundItem = inStockItems.find(
        (item) => item.serialNo.toLowerCase() === query.toLowerCase(),
      );
      if (foundItem) {
        // เช็กไม่ให้แอดของซ้ำลงตะกร้า
        if (saleCart.some((c) => c.itemId === foundItem.id)) {
          setErrorMessage("สินค้าชิ้นนี้ถูกเพิ่มในตะกร้าแล้ว");
          return;
        }

        const weightGrams =
          (BigInt(foundItem.weightMg) / 1000n).toString() +
          "." +
          (BigInt(foundItem.weightMg) % 1000n).toString().padStart(3, "0");
        setSaleCart((prev) => [
          ...prev,
          {
            productId: foundItem.productId,
            itemId: foundItem.id,
            serialNo: foundItem.serialNo,
            name: foundItem.productName,
            sku: foundItem.sku,
            weightGramStr: weightGrams,
            goldPurity: foundItem.goldPurity,
            laborChargeBahtStr: (
              BigInt(foundItem.laborChargeSatang) / 100n
            ).toString(),
            tracking: "SERIALIZED",
            quantity: 1,
          },
        ]);
        setSearchQuery("");
        setErrorMessage("");
        return;
      }

      // 2) หากไม่พบ ให้ค้นจากแบบสินค้า (Product Master) ที่เป็นชนิดนับจำนวน (COUNTED)
      const foundProd = products.find(
        (p) =>
          p.tracking === "COUNTED" &&
          (p.sku.toLowerCase() === query.toLowerCase() ||
            p.name.toLowerCase().includes(query.toLowerCase())),
      );
      if (foundProd) {
        const stdWeight = foundProd.stdWeightMg
          ? (BigInt(foundProd.stdWeightMg) / 1000n).toString()
          : "15.244";

        setSaleCart((prev) => {
          const existing = prev.find((c) => c.productId === foundProd.id);
          if (existing) {
            return prev.map((c) =>
              c.productId === foundProd.id
                ? { ...c, quantity: c.quantity + 1 }
                : c,
            );
          }
          return [
            ...prev,
            {
              productId: foundProd.id,
              name: foundProd.name,
              sku: foundProd.sku,
              weightGramStr: stdWeight,
              goldPurity: foundProd.goldPurity,
              laborChargeBahtStr: "100", // ค่าบล็อกเริ่มต้น
              tracking: "COUNTED",
              quantity: 1,
            },
          ];
        });
        setSearchQuery("");
        setErrorMessage("");
        return;
      }

      setErrorMessage(`ไม่พบสินค้ารหัส "${query}" ในระบบคลังสินค้าพร้อมขาย`);
    } else {
      // โหมดรับซื้อทองเก่า (BUY): ค้นจากแบบสินค้าเพื่อช่วยป้อนข้อมูล
      const foundProd = products.find(
        (p) =>
          p.sku.toLowerCase() === query.toLowerCase() ||
          p.name.toLowerCase().includes(query.toLowerCase()),
      );
      setPurchaseCart((prev) => [
        ...prev,
        {
          productId: foundProd?.id || null,
          description: foundProd ? foundProd.name : "ทองรูปพรรณเก่า",
          weightGramStr: "15.16",
          goldPurity: foundProd ? foundProd.goldPurity : 96.5,
          unitPriceBahtStr: (prices.ornamentBuy / 100n).toString(),
          totalBahtStr: "39200",
        },
      ]);
      setSearchQuery("");
    }
  };

  // ฟังก์ชันคำนวณราคาขายรายชิ้นของตะกร้าฝั่งขาย (SALE)
  const getItemPricing = (item: CartItem) => {
    try {
      const weightMg = mgFromGramString(item.weightGramStr);
      const isOrnament = item.tracking === "SERIALIZED";
      const sellPricePerBaht = isOrnament
        ? prices.ornamentSell
        : prices.barSell;
      const stdWeightMg = isOrnament ? MG_PER_BAHT_ORNAMENT : MG_PER_BAHT_BAR;

      const purityScaled = BigInt(Math.round(item.goldPurity * 100)); // 9650n
      const baseGoldPrice =
        (weightMg * sellPricePerBaht * purityScaled) / (stdWeightMg * 9650n);

      const laborCharge = BigInt(
        Math.round(Number(item.laborChargeBahtStr || "0") * 100),
      );
      const vat = (laborCharge * 7n) / 107n; // VAT 7% inclusive

      const total = baseGoldPrice + laborCharge;

      return {
        baseGoldPrice,
        laborCharge,
        vat,
        total: total * BigInt(item.quantity),
      };
    } catch {
      return { baseGoldPrice: 0n, laborCharge: 0n, vat: 0n, total: 0n };
    }
  };

  // คำนวณสรุปยอดบิลขาขายออก
  const saleSummary = saleCart.reduce(
    (sum, item) => {
      const pricing = getItemPricing(item);
      return {
        total: sum.total + pricing.total,
        vat: sum.vat + pricing.vat,
      };
    },
    { total: 0n, vat: 0n },
  );

  // คำนวณราคารับซื้อสมาคมอัตโนมัติสำหรับการกรอกใบรับซื้อ
  const getAutoBuybackPrice = (item: PurchaseCartItem) => {
    try {
      const weightMg = mgFromGramString(item.weightGramStr);
      const buyPrice = prices.ornamentBuy; // อิงทองรูปพรรณเป็นหลัก
      const purityScaled = BigInt(Math.round(item.goldPurity * 100));
      return (
        (weightMg * buyPrice * purityScaled) / (MG_PER_BAHT_ORNAMENT * 9650n)
      );
    } catch {
      return 0n;
    }
  };

  // สรุปบิลรับซื้อทองคืน
  const purchaseTotalSatang = purchaseCart.reduce((sum, item) => {
    return sum + BigInt(Math.round(Number(item.totalBahtStr || "0") * 100));
  }, 0n);

  // คำนวณผลต่างแลกเปลี่ยน (Trade-In Net)
  const netTradeInTotalSatang = saleSummary.total - purchaseTotalSatang;

  // ผลรวมเงินที่คีย์ในลิ้นชักการรับเงิน
  const totalEnteredSatang =
    BigInt(Math.round(Number(cashPayBaht || "0") * 100)) +
    BigInt(Math.round(Number(transferPayBaht || "0") * 100)) +
    BigInt(Math.round(Number(creditPayBaht || "0") * 100));

  // ส่วนต่างที่เหลือในการชำระเงิน
  const totalTargetSatang =
    posMode === "SALE"
      ? saleSummary.total
      : posMode === "BUY"
        ? purchaseTotalSatang
        : netTradeInTotalSatang;

  const handleCheckout = async () => {
    if (totalTargetSatang !== totalEnteredSatang) {
      setErrorMessage("ยอดชำระที่เลือกรับเงินไม่ตรงกับยอดเงินที่กำหนดในบิล");
      return;
    }

    setIsPending(true);
    setErrorMessage("");
    setSuccessMessage("");

    // สร้างลิสต์ของรายการรับชำระเงิน
    const payments = [];
    if (cashPayBaht) {
      payments.push({
        paymentMethod: PaymentMethod.CASH,
        amountSatang: BigInt(Math.round(Number(cashPayBaht) * 100)),
      });
    }
    if (transferPayBaht) {
      payments.push({
        paymentMethod: PaymentMethod.TRANSFER,
        amountSatang: BigInt(Math.round(Number(transferPayBaht) * 100)),
        referenceNo: transferRef || null,
      });
    }
    if (creditPayBaht) {
      payments.push({
        paymentMethod: PaymentMethod.CREDIT_CARD,
        amountSatang: BigInt(Math.round(Number(creditPayBaht) * 100)),
      });
    }

    const idemKey = `pos-bill-${Date.now()}`;

    try {
      if (posMode === "SALE") {
        const res = await createSalesOrderAction(
          branchId,
          shiftId,
          saleCart.map((c) => ({
            productId: c.productId,
            itemId: c.itemId,
            quantity: c.quantity,
            laborChargeSatang: BigInt(
              Math.round(Number(c.laborChargeBahtStr) * 100),
            ),
          })),
          payments,
          idemKey,
        );
        if (res.error) throw new Error(res.error);
        setSuccessMessage(res.success || "ทำรายการสำเร็จ");
        setLastBillNo(res.orderId || "");
      } else if (posMode === "BUY") {
        const res = await createPurchaseOrderAction(
          branchId,
          shiftId,
          customerName,
          customerPhone,
          purchaseCart.map((p) => ({
            productId: p.productId,
            description: p.description,
            weightMg: mgFromGramString(p.weightGramStr),
            goldPurity: p.goldPurity,
            unitPriceSatang: BigInt(
              Math.round(Number(p.unitPriceBahtStr) * 100),
            ),
            totalAmountSatang: BigInt(Math.round(Number(p.totalBahtStr) * 100)),
          })),
          payments,
          idemKey,
        );
        if (res.error) throw new Error(res.error);
        setSuccessMessage(res.success || "ทำรายการสำเร็จ");
        setLastBillNo(res.orderId || "");
      } else if (posMode === "TRADE") {
        const res = await createTradeInAction(
          branchId,
          shiftId,
          customerName,
          customerPhone,
          saleCart.map((c) => ({
            productId: c.productId,
            itemId: c.itemId,
            quantity: c.quantity,
            laborChargeSatang: BigInt(
              Math.round(Number(c.laborChargeBahtStr) * 100),
            ),
          })),
          purchaseCart.map((p) => ({
            productId: p.productId,
            description: p.description,
            weightMg: mgFromGramString(p.weightGramStr),
            goldPurity: p.goldPurity,
            unitPriceSatang: BigInt(
              Math.round(Number(p.unitPriceBahtStr) * 100),
            ),
            totalAmountSatang: BigInt(Math.round(Number(p.totalBahtStr) * 100)),
          })),
          payments,
          idemKey,
        );
        if (res.error) throw new Error(res.error);
        setSuccessMessage(res.success || "ทำรายการสำเร็จ");
        setLastBillNo(res.tradeInId || "");
      }

      // รีเซ็ต Cart เมื่อเปิดบิลสำเร็จ
      setSaleCart([]);
      setPurchaseCart([]);
      setCashPayBaht("");
      setTransferPayBaht("");
      setCreditPayBaht("");
      setTransferRef("");
      setCustomerName("");
      setCustomerPhone("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเปิดบิล";
      setErrorMessage(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
      {/* พาเนลหลัก ตะกร้าและการสแกน (2/3 width) */}
      <div className="lg:col-span-2 rounded border border-gray-200 p-6 bg-white flex flex-col gap-4">
        {/* เลือกลักษณะบิล */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded">
          <button
            onClick={() => {
              setPosMode("SALE");
              setErrorMessage("");
            }}
            className={`flex-1 text-center py-2 text-sm font-semibold rounded ${
              posMode === "SALE"
                ? "bg-white text-amber-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            บิลขายทองคำใหม่ (Sale)
          </button>
          <button
            onClick={() => {
              setPosMode("BUY");
              setErrorMessage("");
            }}
            className={`flex-1 text-center py-2 text-sm font-semibold rounded ${
              posMode === "BUY"
                ? "bg-white text-amber-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            บิลรับซื้อทองคำเก่า (Buyback)
          </button>
          <button
            onClick={() => {
              setPosMode("TRADE");
              setErrorMessage("");
            }}
            className={`flex-1 text-center py-2 text-sm font-semibold rounded ${
              posMode === "TRADE"
                ? "bg-white text-amber-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            บิลแลกเปลี่ยนเปลี่ยนทอง (Trade-in)
          </button>
        </div>

        {/* ฟอร์มการค้นหาสแกนบาร์โค้ดหรือชื่อของ */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              posMode === "BUY"
                ? "พิมพ์ชื่อหรือประเภททองเก่าเพื่อบันทึกรายการ"
                : "สแกนบาร์โค้ดป้ายสินค้า (SerialNo) หรือค้นหาทองแท่งมาตรฐาน"
            }
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm font-mono focus:border-amber-500 outline-none"
          />
          <button
            type="submit"
            className="rounded bg-gray-800 px-6 text-sm font-semibold text-white hover:bg-gray-900"
          >
            เพิ่มรายการ
          </button>
        </form>

        {errorMessage && (
          <div
            role="alert"
            className="rounded bg-red-50 p-3 text-xs text-red-600 border border-red-200"
          >
            ⚠ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div
            role="alert"
            className="rounded bg-green-50 p-3 text-xs text-green-700 border border-green-200"
          >
            ✓ {successMessage} <br />
            <span className="text-[10px] text-gray-500 font-mono">
              บิลอ้างอิง: {lastBillNo}
            </span>
          </div>
        )}

        {/* รายการตะกร้าสินค้าสำหรับ SALE / TRADE */}
        {(posMode === "SALE" || posMode === "TRADE") && (
          <div className="flex-1 overflow-x-auto min-h-64">
            <h3 className="font-bold text-sm mb-2 text-amber-900">
              ตะกร้าทองคำที่จะขายออก ({saleCart.length} รายการ)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 pr-3">ป้ายสินค้า / SKU</th>
                  <th className="py-2 pr-3">แบบสินค้า</th>
                  <th className="py-2 pr-3">น้ำหนัก (กรัม)</th>
                  <th className="py-2 pr-3">ความบริสุทธิ์</th>
                  <th className="py-2 pr-3">ค่ากำเหน็จ (บาท)</th>
                  <th className="py-2 pr-3 text-right">ราคารวมเนื้อ+กำเหน็จ</th>
                  <th className="py-2 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {saleCart.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-400 italic"
                    >
                      ยังไม่มีสินค้าขายออกในตะกร้า (ลองยิงบาร์โค้ด เช่น
                      TAG-RING-001 หรือ SKU ทองแท่ง)
                    </td>
                  </tr>
                ) : (
                  saleCart.map((item, idx) => {
                    const pricing = getItemPricing(item);

                    return (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 pr-3 font-mono">
                          {item.serialNo || item.sku}
                        </td>
                        <td className="py-2 pr-3">{item.name}</td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            value={item.weightGramStr}
                            disabled={item.tracking === "SERIALIZED"}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSaleCart((prev) =>
                                prev.map((c, i) =>
                                  i === idx ? { ...c, weightGramStr: val } : c,
                                ),
                              );
                            }}
                            className="w-16 rounded border border-gray-200 px-1 py-0.5 text-center font-mono disabled:bg-gray-50"
                          />
                        </td>
                        <td className="py-2 pr-3 font-mono">
                          {item.goldPurity}%
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            value={item.laborChargeBahtStr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSaleCart((prev) =>
                                prev.map((c, i) =>
                                  i === idx
                                    ? { ...c, laborChargeBahtStr: val }
                                    : c,
                                ),
                              );
                            }}
                            className="w-20 rounded border border-gray-300 px-2 py-0.5 text-right font-mono"
                          />
                        </td>
                        <td className="py-2 pr-3 text-right font-mono font-bold text-amber-900">
                          {formatSatangAsBaht(pricing.total)}
                        </td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() =>
                              setSaleCart((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            className="text-red-500 hover:text-red-700 font-semibold"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* รายการตะกร้าสินค้ารับซื้อคืน (BUY / TRADE ขารับเข้า) */}
        {(posMode === "BUY" || posMode === "TRADE") && (
          <div className="flex-1 overflow-x-auto min-h-64 border-t border-gray-100 pt-4">
            <h3 className="font-bold text-sm mb-2 text-blue-900">
              รายการรับซื้อทองเก่าคืน ({purchaseCart.length} รายการ)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 pr-3">รายละเอียดทองรับซื้อ</th>
                  <th className="py-2 pr-3">น้ำหนัก (กรัม)</th>
                  <th className="py-2 pr-3">ความบริสุทธิ์</th>
                  <th className="py-2 pr-3">ราคามาตรฐานรับซื้อ</th>
                  <th className="py-2 pr-3">ราคารวมตกลงซื้อคืน (บาท)</th>
                  <th className="py-2 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {purchaseCart.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-gray-400 italic"
                    >
                      ยังไม่มีรายการทองคำรับซื้อคืนในบิลนี้
                    </td>
                  </tr>
                ) : (
                  purchaseCart.map((item, idx) => {
                    const autoPrice = getAutoBuybackPrice(item);

                    return (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPurchaseCart((prev) =>
                                prev.map((p, i) =>
                                  i === idx ? { ...p, description: val } : p,
                                ),
                              );
                            }}
                            className="w-40 rounded border border-gray-300 px-2 py-0.5"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            value={item.weightGramStr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPurchaseCart((prev) =>
                                prev.map((p, i) =>
                                  i === idx ? { ...p, weightGramStr: val } : p,
                                ),
                              );
                            }}
                            className="w-16 rounded border border-gray-300 px-1 py-0.5 text-center font-mono"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            step="0.01"
                            value={item.goldPurity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPurchaseCart((prev) =>
                                prev.map((p, i) =>
                                  i === idx ? { ...p, goldPurity: val } : p,
                                ),
                              );
                            }}
                            className="w-16 rounded border border-gray-300 px-1 py-0.5 text-center font-mono"
                          />
                        </td>
                        <td className="py-2 pr-3 font-mono text-gray-500">
                          {formatSatangAsBaht(autoPrice)}
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            value={item.totalBahtStr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPurchaseCart((prev) =>
                                prev.map((p, i) =>
                                  i === idx ? { ...p, totalBahtStr: val } : p,
                                ),
                              );
                            }}
                            className="w-24 rounded border border-gray-300 px-2 py-0.5 text-right font-mono font-bold text-blue-900"
                          />
                        </td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() =>
                              setPurchaseCart((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            className="text-red-500 hover:text-red-700 font-semibold"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* พาเนลชำระเงินและบันทึกใบเสร็จ (1/3 width) */}
      <div className="rounded border border-gray-200 p-6 bg-white flex flex-col gap-4 justify-between">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-base border-b border-gray-100 pb-2">
            สรุปรายการและรับชำระเงิน
          </h2>

          {/* ข้อมูลลูกค้าเมื่อจำเป็น (สำหรับใบเสร็จรับเงินใบรับซื้อทองเก่า/ใบกำกับภาษี) */}
          {(posMode === "BUY" || posMode === "TRADE") && (
            <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
              <p className="font-semibold text-gray-700">
                ข้อมูลผู้ขายทองเก่าคืน *
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="เช่น นายสมชาย แสนดี"
                  className="rounded border border-gray-300 px-2 py-1 bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="เช่น 0812345678"
                  className="rounded border border-gray-300 px-2 py-1 bg-white"
                />
              </div>
            </div>
          )}

          {/* การแสดงราคาสรุปตามประเภทโหมด */}
          <div className="flex flex-col gap-2 font-semibold text-sm border-b border-gray-200 pb-4">
            {posMode === "SALE" && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">ยอดบิลขายออก:</span>
                  <span className="font-mono">
                    {formatSatangAsBaht(saleSummary.total)} บาท
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>(ในจำนวนนี้เป็น VAT 7% จากกำเน็จ):</span>
                  <span className="font-mono">
                    {formatSatangAsBaht(saleSummary.vat)} บาท
                  </span>
                </div>
              </>
            )}

            {posMode === "BUY" && (
              <div className="flex justify-between text-blue-900 text-base">
                <span>ยอดจ่ายคืนรับซื้อ:</span>
                <span className="font-mono font-bold">
                  {formatSatangAsBaht(purchaseTotalSatang)} บาท
                </span>
              </div>
            )}

            {posMode === "TRADE" && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">ยอดขายออก:</span>
                  <span className="font-mono">
                    {formatSatangAsBaht(saleSummary.total)} บาท
                  </span>
                </div>
                <div className="flex justify-between text-blue-900">
                  <span>หักยอดรับซื้อเก่า:</span>
                  <span className="font-mono">
                    -{formatSatangAsBaht(purchaseTotalSatang)} บาท
                  </span>
                </div>
                <div className="flex justify-between text-base border-t border-dashed border-gray-200 pt-2 mt-1">
                  <span>ยอดสุทธิเปลี่ยนทอง:</span>
                  <span
                    className={`font-mono font-bold ${
                      netTradeInTotalSatang >= 0n
                        ? "text-amber-900"
                        : "text-blue-900"
                    }`}
                  >
                    {netTradeInTotalSatang >= 0n ? "" : "ร้านต้องคืนเงิน "}
                    {formatSatangAsBaht(
                      netTradeInTotalSatang >= 0n
                        ? netTradeInTotalSatang
                        : -netTradeInTotalSatang,
                    )}{" "}
                    บาท
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ช่องทางการชำระเงิน (Split Payments) */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-gray-700">
              เลือกวิธีกระจายรับ/จ่ายชำระเงิน (Split)
            </h3>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="w-20 font-semibold text-gray-600">
                  เงินสด (Cash)
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={cashPayBaht}
                  onChange={(e) => setCashPayBaht(e.target.value)}
                  className="w-32 rounded border border-gray-300 px-2 py-1 text-right font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="w-20 font-semibold text-gray-600">
                  เงินโอน (Bank)
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={transferPayBaht}
                  onChange={(e) => setTransferPayBaht(e.target.value)}
                  className="w-32 rounded border border-gray-300 px-2 py-1 text-right font-mono"
                />
              </div>
              {transferPayBaht && (
                <input
                  type="text"
                  placeholder="เลขรหัสอ้างอิงสลิปโอนเงิน"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-right text-xs font-mono ml-auto w-48"
                />
              )}

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="w-20 font-semibold text-gray-600">
                  รูดบัตร (Card)
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={creditPayBaht}
                  onChange={(e) => setCreditPayBaht(e.target.value)}
                  className="w-32 rounded border border-gray-300 px-2 py-1 text-right font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ยอดเงินชำระเปรียบเทียบ */}
        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 font-mono">
            <span>ชำระรวมที่คีย์:</span>
            <span>{formatSatangAsBaht(totalEnteredSatang)} บาท</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-mono">
            <span>ยอดสุทธิเป้าหมาย:</span>
            <span>{formatSatangAsBaht(totalTargetSatang)} บาท</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={
              isPending ||
              totalTargetSatang !== totalEnteredSatang ||
              (posMode === "SALE" && saleCart.length === 0) ||
              (posMode === "BUY" && purchaseCart.length === 0)
            }
            className="w-full rounded bg-amber-600 hover:bg-amber-700 py-3 text-sm font-bold text-white disabled:bg-amber-300 cursor-pointer text-center mt-2"
          >
            {isPending
              ? "กำลังบันทึกและตัดสต๊อก..."
              : "ยืนยันและเปิดบิลเสร็จสิ้น"}
          </button>
        </div>
      </div>
    </div>
  );
}
