import { describe, expect, it } from "vitest";
import {
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";

describe("buildSequenceKey", () => {
  it("ประกอบ key จากประเภทเอกสาร-สาขา-ปี พ.ศ.", () => {
    expect(buildSequenceKey("TAXINV", "BKK01", 2569)).toBe("TAXINV-BKK01-2569");
  });

  it("ปฏิเสธตัวอักษรนอก A-Z/0-9 (กัน key ชนกันจาก delimiter)", () => {
    expect(() => buildSequenceKey("TAX-INV", "BKK01", 2569)).toThrow();
    expect(() => buildSequenceKey("taxinv", "BKK01", 2569)).toThrow();
    expect(() => buildSequenceKey("TAXINV", "", 2569)).toThrow();
  });

  it("ปฏิเสธปี พ.ศ. นอกช่วงสมเหตุสมผล", () => {
    expect(() => buildSequenceKey("TAXINV", "BKK01", 2026)).toThrow();
    expect(() => buildSequenceKey("TAXINV", "BKK01", 2569.5)).toThrow();
  });
});

describe("formatDocumentNumber", () => {
  it("เติมศูนย์ให้ครบความกว้าง", () => {
    expect(formatDocumentNumber("INV-BKK01-2569", 42n)).toBe(
      "INV-BKK01-2569-000042",
    );
    expect(formatDocumentNumber("INV-BKK01-2569", 1n)).toBe(
      "INV-BKK01-2569-000001",
    );
  });

  it("เลขเกินความกว้างไม่ถูกตัดทอน", () => {
    expect(formatDocumentNumber("X", 1234567n)).toBe("X-1234567");
  });

  it("ปฏิเสธเลขศูนย์หรือติดลบ", () => {
    expect(() => formatDocumentNumber("X", 0n)).toThrow();
    expect(() => formatDocumentNumber("X", -1n)).toThrow();
  });
});
