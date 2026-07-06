"use client";

import { useActionState, useState } from "react";
import {
  startWorkAction,
  issueGoldAction,
  completeWorkOrderAction,
  deliverWorkOrderAction,
  cancelWorkOrderAction,
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

export function IssueGoldForm({ workOrderId }: { workOrderId: string }) {
  const [state, action, isPending] = useActionState(issueGoldAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="workOrderId" value={workOrderId} />
      <Message state={state} />
      <label className="text-xs font-semibold text-gray-700">
        เบิกทองช่าง (กรัม)
      </label>
      <input
        type="text"
        name="weightGramStr"
        required
        placeholder="เช่น 15.160"
        className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white disabled:bg-blue-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "บันทึกเบิกทอง"}
      </button>
    </form>
  );
}

export function StartWorkForm({ workOrderId }: { workOrderId: string }) {
  const [state, action, isPending] = useActionState(startWorkAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="workOrderId" value={workOrderId} />
      <Message state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:bg-blue-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "เริ่มดำเนินงาน"}
      </button>
    </form>
  );
}

export function CompleteWorkOrderForm({
  workOrderId,
}: {
  workOrderId: string;
}) {
  const [state, action, isPending] = useActionState(
    completeWorkOrderAction,
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="workOrderId" value={workOrderId} />
      <Message state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-green-600 hover:bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:bg-green-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "งานเสร็จสมบูรณ์"}
      </button>
    </form>
  );
}

export function DeliverWorkOrderForm({ workOrderId }: { workOrderId: string }) {
  const [state, action, isPending] = useActionState(deliverWorkOrderAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="workOrderId" value={workOrderId} />
      <Message state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-green-700 hover:bg-green-800 px-3 py-2 text-xs font-semibold text-white disabled:bg-green-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "ส่งมอบให้ลูกค้า"}
      </button>
    </form>
  );
}

export function CancelWorkOrderForm({ workOrderId }: { workOrderId: string }) {
  const [state, action, isPending] = useActionState(cancelWorkOrderAction, {});
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded border border-red-300 text-red-700 hover:bg-red-50 px-3 py-2 text-xs font-semibold cursor-pointer"
      >
        ยกเลิกใบสั่งงาน
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
          ยกเลิกใบสั่งงาน
        </h3>
        <Message state={state} />
        <input type="hidden" name="workOrderId" value={workOrderId} />
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
        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
          >
            ปิด
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white disabled:bg-red-400 cursor-pointer"
          >
            {isPending ? "กำลังดำเนินการ..." : "ยืนยันยกเลิก"}
          </button>
        </div>
      </form>
    </div>
  );
}
