"use client";

import { useActionState, useState } from "react";
import { lockPeriodAction, unlockPeriodAction } from "../actions";

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

function PeriodApprovalModal({
  yearMonth,
  action,
  triggerLabel,
  triggerClassName,
  title,
}: {
  yearMonth: string;
  action: (
    prev: { error?: string; success?: string },
    formData: FormData,
  ) => Promise<{ error?: string; success?: string }>;
  triggerLabel: string;
  triggerClassName: string;
  title: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        action={formAction}
        className="bg-white rounded border border-gray-200 p-6 max-w-sm w-full flex flex-col gap-3 shadow-xl text-left"
      >
        <h3 className="font-bold text-base border-b border-gray-100 pb-2">
          {title} {yearMonth}
        </h3>
        <Message state={state} />
        <input type="hidden" name="yearMonth" value={yearMonth} />
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
            รหัส PIN *
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

export function LockPeriodButton({ yearMonth }: { yearMonth: string }) {
  return (
    <PeriodApprovalModal
      yearMonth={yearMonth}
      action={lockPeriodAction}
      title="ปิดงวดบัญชี"
      triggerLabel="ปิดงวด"
      triggerClassName="rounded bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
    />
  );
}

export function UnlockPeriodButton({ yearMonth }: { yearMonth: string }) {
  return (
    <PeriodApprovalModal
      yearMonth={yearMonth}
      action={unlockPeriodAction}
      title="เปิดงวดบัญชีกลับมา"
      triggerLabel="เปิดงวดกลับมา"
      triggerClassName="rounded border border-amber-300 text-amber-700 hover:bg-amber-50 px-3 py-1.5 text-xs font-semibold cursor-pointer"
    />
  );
}
