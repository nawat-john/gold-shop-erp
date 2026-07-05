"use client";

import { useState, useRef } from "react";
import { scanCountItemAction } from "../../actions";

export function StockScanner({ countId }: { countId: string }) {
  const [serialNo, setSerialNo] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = serialNo.trim();
    if (!barcode) return;

    setIsPending(true);
    setMessage(null);

    const res = await scanCountItemAction(countId, barcode);
    setIsPending(false);

    if (res.success) {
      setMessage({
        type: "success",
        text: `สแกนนับป้ายสินค้า [${barcode}] สำเร็จ`,
      });
      setSerialNo("");
    } else {
      setMessage({ type: "error", text: res.error || "เกิดข้อผิดพลาด" });
    }

    // โฟกัสกลับไปที่กล่อง Input เสมอเพื่ออำนวยความสะดวกให้เครื่องยิงบาร์โค้ด
    inputRef.current?.focus();
  };

  return (
    <div className="rounded border border-gray-200 p-6 bg-white flex flex-col gap-4 max-w-md w-full">
      <h3 className="font-semibold text-base border-b border-gray-100 pb-2">
        เครื่องสแกนป้ายทอง (Barcode Scanner)
      </h3>

      {message && (
        <div
          role="alert"
          className={`rounded p-2.5 text-xs border ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {message.type === "success" ? "✓" : "⚠"} {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={serialNo}
          onChange={(e) => setSerialNo(e.target.value)}
          placeholder="ยิงบาร์โค้ด หรือพิมพ์ SerialNo"
          disabled={isPending}
          autoFocus
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !serialNo.trim()}
          className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:bg-amber-400"
        >
          {isPending ? "กำลังบันทึก..." : "ส่ง"}
        </button>
      </form>
      <p className="text-[10px] text-gray-500 italic">
        * โฟกัสอยู่ที่ช่องกรอกเสมอ เหมาะสมกับหัวอ่าน Smart Scanner /
        เครื่องสแกนแบบ USB ทั่วไป
      </p>
    </div>
  );
}
