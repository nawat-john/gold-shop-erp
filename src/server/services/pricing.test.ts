import { describe, expect, it } from "vitest";
import {
  calculateSalePrice,
  calculateBuybackPrice,
  calculateTradeInNet,
} from "./pricing.service";

describe("Pricing & VAT Service Tests", () => {
  const dummyAnnouncement = {
    barBuy: 4000000n, // 40,000 บาท
    barSell: 4010000n, // 40,100 บาท
    ornamentBuy: 3920000n, // 39,200 บาท
    ornamentSell: 4060000n, // 40,600 บาท
  };

  it("1. คำนวณราคาขายทองรูปพรรณ (Ornament) ความบริสุทธิ์มาตรฐาน 96.50%", () => {
    // ทองรูปพรรณน้ำหนัก 1 บาท = 15.16 กรัม (15160 มก.)
    const res = calculateSalePrice({
      tracking: "SERIALIZED",
      weightMg: 15160n,
      goldPurity: 96.5,
      laborChargeSatang: 107000n, // ค่ากำเหน็จ 1,070 บาท (รวม VAT 70 บาท)
      announcement: dummyAnnouncement,
    });

    // ราคาเนื้อทองควรเท่ากับประกาศสมาคมขายออก = 40,600 บาท (4,060,000 สตางค์)
    expect(res.baseGoldPriceSatang).toBe(4060000n);
    expect(res.laborChargeSatang).toBe(107000n);
    // VAT 7% จากค่ากำเหน็จรวม VAT 1,070 บาท = 1070 * 7 / 107 = 70 บาท (7,000 สตางค์)
    expect(res.vatAmountSatang).toBe(7000n);
    // ราคารวมสุทธิ = 40,600 + 1,070 = 41,670 บาท
    expect(res.totalAmountSatang).toBe(4167000n);
  });

  it("2. คำนวณราคาขายทองคำแท่ง (Gold Bar) ความบริสุทธิ์มาตรฐาน 96.50%", () => {
    // ทองแท่งน้ำหนัก 1 บาท = 15.244 กรัม (15244 มก.)
    const res = calculateSalePrice({
      tracking: "COUNTED",
      weightMg: 15244n,
      goldPurity: 96.5,
      laborChargeSatang: 10000n, // ค่าบล็อก/ค่ากำเหน็จ 100 บาท
      announcement: dummyAnnouncement,
    });

    // ราคาเนื้อทองควรเท่ากับประกาศสมาคมขายออก = 40,100 บาท (4,010,000 สตางค์)
    expect(res.baseGoldPriceSatang).toBe(4010000n);
    // VAT 7% จากค่ากำเหน็จ 100 บาท (แบบรวม VAT = 100 * 7 / 107 = 6.54 บาท -> ปัดขึ้นเป็น 7 บาท / 654 สตางค์)
    // 10000n * 7n / 107n = 654.2 -> 654 สตางค์
    expect(res.vatAmountSatang).toBe(654n);
    expect(res.totalAmountSatang).toBe(4020000n);
  });

  it("3. คำนวณราคาขายแบบปรับลดสัดส่วนตามความบริสุทธิ์ทอง (90.00% Purity)", () => {
    // ทองคำรูปพรรณหนัก 15.16 กรัม แต่มีความบริสุทธิ์ 90.00%
    const res = calculateSalePrice({
      tracking: "SERIALIZED",
      weightMg: 15160n,
      goldPurity: 90.0,
      laborChargeSatang: 0n,
      announcement: dummyAnnouncement,
    });

    // ราคาเนื้อทองควรลดลง: 4,060,000 * 90 / 96.5 = 3,786,528.49 -> ปัดเศษเป็น 3,786,528 สตางค์
    // (15160n * 4060000n * 9000n) / (15160n * 9650n) = 3786528.497
    expect(res.baseGoldPriceSatang).toBe(3786528n);
  });

  it("4. คำนวณราคารับซื้อทองคืน (Buyback) 96.50% เทียบกับ 90.00%", () => {
    // รับซื้อทองรูปพรรณหนัก 15.16 กรัม (1 บาททอง) 96.50%
    const standardBuy = calculateBuybackPrice({
      tracking: "SERIALIZED",
      weightMg: 15160n,
      goldPurity: 96.5,
      announcement: dummyAnnouncement,
    });
    expect(standardBuy).toBe(3920000n); // ควรเท่ากับราคารับซื้อสมาคม 39,200 บาท

    // รับซื้อทองรูปพรรณหนัก 15.16 กรัม 90.00%
    const lowPurityBuy = calculateBuybackPrice({
      tracking: "SERIALIZED",
      weightMg: 15160n,
      goldPurity: 90.0,
      announcement: dummyAnnouncement,
    });
    // 3,920,000 * 90 / 96.5 = 3,655,958.54 -> 3,655,958 สตางค์
    expect(lowPurityBuy).toBe(3655958n);
  });

  it("5. คำนวณส่วนต่างของบิลเปลี่ยนทอง (Trade-In Difference)", () => {
    // บิลขายออก 50,000 บาท, บิลรับคืน 45,000 บาท -> ลูกค้าจ่ายเพิ่ม 5,000 บาท (500,000 สตางค์)
    const netPayable = calculateTradeInNet(5000000n, 4500000n);
    expect(netPayable).toBe(500000n);

    // บิลขายออก 40,000 บาท, บิลรับคืน 42,000 บาท -> ร้านคืนเงิน 2,000 บาท (-200,000 สตางค์)
    const netRefundable = calculateTradeInNet(4000000n, 4200000n);
    expect(netRefundable).toBe(-200000n);
  });
});
