// Adapter interface สำหรับแหล่งราคาทองภายนอก — ตามแผน §9: mock ทุก integration ใน dev
// เปลี่ยนไปใช้ API/scraper จริงได้โดย implement interface นี้เพิ่ม (ไม่แตะโค้ดส่วนอื่น)

/** ราคา 1 รอบประกาศ — สตางค์ต่อบาททอง */
export interface FeedQuote {
  source: string;
  announcedAt: Date;
  barBuy: bigint;
  barSell: bigint;
  ornamentBuy: bigint;
  ornamentSell: bigint;
  raw?: unknown;
}

export interface GoldPriceFeedSource {
  /** ดึงประกาศล่าสุด — โยน error เมื่อ feed ล่ม (caller จัดการ retry/fallback) */
  fetchLatest(): Promise<FeedQuote>;
}

export const GTA_SOURCE = "GTA"; // สมาคมค้าทองคำ
export const MANUAL_SOURCE = "MANUAL";

/**
 * Mock feed สำหรับ dev/test — ราคาแกว่งรอบฐานแบบ deterministic ตามช่วงเวลา
 * (นาทีเดียวกันได้ราคาเดียวกัน → dedupe ทำงานเหมือน feed จริงที่ประกาศเป็นรอบ)
 */
export class MockGoldPriceFeedSource implements GoldPriceFeedSource {
  constructor(
    /** ฐานราคาแท่งขายออก สตางค์/บาททอง (default 51,000 บาท) */
    private readonly baseBarSell: bigint = 5_100_000n,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async fetchLatest(): Promise<FeedQuote> {
    const current = this.now();
    // ปัดเวลาลงเป็นรอบ 5 นาที = 1 รอบประกาศ
    const roundMs = 5 * 60 * 1000;
    const announcedAt = new Date(
      Math.floor(current.getTime() / roundMs) * roundMs,
    );

    // แกว่ง ±50 บาท ตามหมายเลขรอบ (deterministic)
    const roundNo = BigInt(Math.floor(announcedAt.getTime() / roundMs));
    const wobble = ((roundNo % 21n) - 10n) * 500n; // -5,000..+5,000 สตางค์

    const barSell = this.baseBarSell + wobble;
    return {
      source: GTA_SOURCE,
      announcedAt,
      barSell,
      barBuy: barSell - 10_000n, // ต่ำกว่าขายออก 100 บาท
      ornamentSell: barSell + 80_000n, // รูปพรรณขายออกสูงกว่าแท่ง
      ornamentBuy: barSell - 51_800n, // รับซื้อรูปพรรณต่ำกว่า (หักตามเกณฑ์สมาคม)
      raw: { mock: true, roundNo: roundNo.toString() },
    };
  }
}
