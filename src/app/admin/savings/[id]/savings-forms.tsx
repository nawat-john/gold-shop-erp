"use client";

import { useActionState, useState } from "react";
import {
  depositAction,
  closeForGoldAction,
  closeForCashAction,
  closeDefaultedAction,
} from "../actions";

function Message({ state }: { state: { error?: string; success?: string } }) {
  if (state.error) {
    return (
      <div
        role="alert"
        className="rounded bg-red-50 p-2 text-xs text-red-600 border border-red-200"
      >
        ⚠ {state.error}
      </div>
    );
  }
  if (state.success) {
    return (
      <div
        role="alert"
        className="rounded bg-green-50 p-2 text-xs text-green-700 border border-green-200"
      >
        ✓ {state.success}
      </div>
    );
  }
  return null;
}

export function DepositForm({ accountId }: { accountId: string }) {
  const [state, action, isPending] = useActionState(depositAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="accountId" value={accountId} />
      <Message state={state} />
      <label className="text-xs font-semibold text-gray-700">
        จำนวนเงินฝาก (บาท)
      </label>
      <input
        type="text"
        name="amountBahtStr"
        required
        placeholder="เช่น 1000.00"
        className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white disabled:bg-amber-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "รับฝากเงิน"}
      </button>
    </form>
  );
}

export function CloseForGoldForm({ accountId }: { accountId: string }) {
  const [state, action, isPending] = useActionState(closeForGoldAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="accountId" value={accountId} />
      <Message state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-green-600 hover:bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:bg-green-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "ปิดบัญชีรับทอง (ครบ)"}
      </button>
    </form>
  );
}

export function CloseForCashForm({ accountId }: { accountId: string }) {
  const [state, action, isPending] = useActionState(closeForCashAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="accountId" value={accountId} />
      <Message state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded border border-gray-300 hover:bg-gray-50 px-3 py-2 text-xs font-semibold cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "ปิดบัญชีรับเงินคืน (ยกเลิก)"}
      </button>
    </form>
  );
}

export function CloseDefaultedForm({ accountId }: { accountId: string }) {
  const [state, action, isPending] = useActionState(closeDefaultedAction, {});
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded border border-red-300 text-red-700 hover:bg-red-50 px-3 py-2 text-xs font-semibold cursor-pointer"
      >
        ปิดบัญชีกรณีผิดนัด
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        action={action}
        className="bg-white rounded border border-gray-200 p-6 max-w-sm w-full flex flex-col gap-3 shadow-xl text-left"
      >
        <h3 className="font-bold text-base border-b border-gray-100 pb-2 text-red-700">
          ปิดบัญชีกรณีผิดนัด
        </h3>
        <Message state={state} />
        <input type="hidden" name="accountId" value={accountId} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            เหตุผล *
          </label>
          <textarea
            name="reason"
            required
            rows={2}
            className="rounded border border-gray-300 px-3 py-1.5 text-xs"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Username ผู้อนุมัติ *
          </label>
          <input
            type="text"
            name="approverUsername"
            required
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            รหัส PIN อนุมัติ *
          </label>
          <input
            type="password"
            name="pin"
            required
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono text-center tracking-widest"
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
            className="rounded bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white disabled:bg-red-400 cursor-pointer"
          >
            {isPending ? "กำลังดำเนินการ..." : "ยืนยัน"}
          </button>
        </div>
      </form>
    </div>
  );
}
