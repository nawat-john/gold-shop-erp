"use client";

import { useActionState, useState } from "react";
import { voidOrderAction } from "../actions";

interface VoidOrderFormProps {
  orderId: string;
  orderType: "SALES" | "PURCHASE" | "TRADE_IN";
  docNo: string;
}

export function VoidOrderForm({
  orderId,
  orderType,
  docNo,
}: VoidOrderFormProps) {
  const [state, action, isPending] = useActionState(voidOrderAction, {});
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
      >
        ยกเลิกบิลนี้ (Void)
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        action={action}
        className="bg-white rounded border border-gray-200 p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl text-left"
      >
        <h3 className="font-bold text-base border-b border-gray-100 pb-2 text-red-700">
          ขอยกเลิกบิล {docNo} (Void)
        </h3>

        {state.error && (
          <div
            role="alert"
            className="rounded bg-red-50 p-2.5 text-xs text-red-600 border border-red-200"
          >
            ⚠ {state.error}
          </div>
        )}
        {state.success && (
          <div
            role="alert"
            className="rounded bg-green-50 p-2.5 text-xs text-green-700 border border-green-200"
          >
            ✓ {state.success}
          </div>
        )}

        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="orderType" value={orderType} />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            เหตุผลในการยกเลิกบิล *
          </label>
          <textarea
            name="voidReason"
            required
            rows={2}
            className="rounded border border-gray-300 px-3 py-1.5 text-xs"
            placeholder="เช่น ป้อนน้ำหนักผิด หรือ ลูกค้าเปลี่ยนใจ"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Username ผู้อนุมัติ (Checker) *
          </label>
          <input
            type="text"
            name="approverUsername"
            required
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono"
            placeholder="เช่น manager หรือ owner"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            รหัส PIN อนุมัติ (6 หลัก) *
          </label>
          <input
            type="password"
            name="pin"
            required
            maxLength={12}
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono text-center tracking-widest"
            placeholder="••••••"
          />
        </div>

        <p className="text-[10px] text-gray-500 italic">
          * ระบบกำหนดให้ผู้อนุมัติต้องไม่ใช่คนเดียวกันกับผู้ขาย (Maker-Checker)
        </p>

        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white disabled:bg-red-400 cursor-pointer"
          >
            {isPending ? "กำลังดำเนินการ..." : "ยืนยันยกเลิกบิล"}
          </button>
        </div>
      </form>
    </div>
  );
}
