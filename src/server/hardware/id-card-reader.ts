// Adapter interface สำหรับเครื่องอ่านบัตรประชาชน (smart card reader) — mock ในทุก dev/test
// ตามแผน §9: mock ฮาร์ดแวร์ทุกชนิด เปลี่ยนไปใช้เครื่องอ่านจริงได้โดย implement interface นี้เพิ่ม

export interface CustomerIdCardReadResult {
  citizenId: string;
  name: string;
  address?: string;
  dateOfBirth?: Date;
}

export interface CustomerIdCardReader {
  /** อ่านบัตรที่เสียบอยู่ — โยน error เมื่อไม่มีบัตร/อ่านไม่สำเร็จ */
  read(): Promise<CustomerIdCardReadResult>;
}

/** Mock เครื่องอ่านบัตรสำหรับ dev/demo — คืนข้อมูลจำลองคงที่ ไม่ตรวจ checksum เลขบัตรจริง */
export class MockCustomerIdCardReader implements CustomerIdCardReader {
  async read(): Promise<CustomerIdCardReadResult> {
    const citizenId = Array.from({ length: 13 }, () =>
      Math.floor(Math.random() * 10),
    ).join("");
    return {
      citizenId,
      name: "สมมติ ทดสอบระบบ",
      address: "กรุงเทพมหานคร",
    };
  }
}
