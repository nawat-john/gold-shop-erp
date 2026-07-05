"use client";

import { useActionState, useState } from "react";
import { sendToMeltAction, closeMeltLotAction } from "../actions";

export function SendToMeltModal({ lotId }: { lotId: string }) {
  const [state, action, isPending] = useActionState(sendToMeltAction, {});
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
      >
        ยืนยันส่งหลอม (ชั่งน้ำหนัก)
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        action={action}
        className="bg-white rounded border border-gray-200 p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl text-left"
      >
        <h3 className="font-bold text-base border-b border-gray-100 pb-2">
          ยืนยันการส่งทองเก่าไปหลอม
        </h3>

        {state.error && (
          <div
            role="alert"
            className="rounded bg-red-50 p-2.5 text-xs text-red-600 border border-red-200"
          >
            ⚠ {state.error}
          </div>
        )}

        <input type="hidden" name="lotId" value={lotId} />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            น้ำหนักชั่งจริงก่อนส่ง (กรัม) *
          </label>
          <input
            type="text"
            name="sentWeightGramStr"
            required
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono"
            placeholder="เช่น 15.16"
          />
        </div>

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
            {isPending ? "กำลังบันทึก..." : "ยืนยันส่งออก"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CloseMeltLotModal({ lotId }: { lotId: string }) {
  const [state, action, isPending] = useActionState(closeMeltLotAction, {});
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-green-600 hover:bg-green-700 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
      >
        ปิดรอบหลอม (รับเนื้อทองคืน)
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        action={action}
        className="bg-white rounded border border-gray-200 p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl text-left"
      >
        <h3 className="font-bold text-base border-b border-gray-100 pb-2">
          ปิดรอบและกระทบยอดการหลอม
        </h3>

        {state.error && (
          <div
            role="alert"
            className="rounded bg-red-50 p-2.5 text-xs text-red-600 border border-red-200"
          >
            ⚠ {state.error}
          </div>
        )}

        <input type="hidden" name="lotId" value={lotId} />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            น้ำหนักทองคำที่ได้รับคืน (กรัม) *
          </label>
          <input
            type="text"
            name="returnedWeightGramStr"
            required
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono"
            placeholder="เช่น 14.85"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            มูลค่าเนื้อทองคำที่ตีคืน (บาท) *
          </label>
          <input
            type="text"
            name="returnedBahtStr"
            required
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono"
            placeholder="เช่น 37000.00"
          />
        </div>

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
            className="rounded bg-green-600 hover:bg-green-700 px-4 py-1.5 text-xs font-bold text-white disabled:bg-green-400 cursor-pointer"
          >
            {isPending ? "กำลังบันทึก..." : "ยืนยันปิดยอด"}
          </button>
        </div>
      </form>
    </div>
  );
}
