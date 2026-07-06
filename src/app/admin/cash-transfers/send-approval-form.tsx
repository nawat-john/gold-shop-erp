"use client";

import { useActionState, useState } from "react";
import { sendCashTransferAction } from "./actions";

export function SendCashTransferForm({ transferId }: { transferId: string }) {
  const [state, action, isPending] = useActionState(sendCashTransferAction, {});
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
      >
        ยืนยันการส่งเงิน (PIN)
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        action={action}
        className="bg-white rounded border border-gray-200 p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl"
      >
        <h3 className="font-bold text-base border-b border-gray-100 pb-2">
          ยืนยันการส่งเงินสดข้ามสาขา (Step-up Auth)
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

        <input type="hidden" name="transferId" value={transferId} />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Username ผู้อนุมัติ (Checker)
          </label>
          <input
            type="text"
            name="approverUsername"
            required
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono"
            placeholder="เช่น owner หรือ manager"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            รหัส PIN อนุมัติ (6 หลัก)
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
          * ระบบกำหนดให้ผู้อนุมัติต้องไม่ใช่คนเดียวกันกับผู้สร้างใบโอน
          (Maker-Checker)
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
            className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white disabled:bg-blue-400 cursor-pointer"
          >
            {isPending ? "กำลังตรวจสอบ..." : "ยืนยันส่งเงิน"}
          </button>
        </div>
      </form>
    </div>
  );
}
