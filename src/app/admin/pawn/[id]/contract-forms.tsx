"use client";

import { useActionState, useState } from "react";
import {
  renewInterestAction,
  redeemContractAction,
  adjustPrincipalAction,
  forfeitContractAction,
  cancelContractAction,
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

export function RenewInterestForm({ contractId }: { contractId: string }) {
  const [state, action, isPending] = useActionState(renewInterestAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="contractId" value={contractId} />
      <Message state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:bg-blue-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "ต่อดอกเบี้ย (ชำระถึงวันนี้)"}
      </button>
    </form>
  );
}

export function RedeemForm({ contractId }: { contractId: string }) {
  const [state, action, isPending] = useActionState(redeemContractAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="contractId" value={contractId} />
      <Message state={state} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-green-600 hover:bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:bg-green-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "ไถ่ถอนทองคืนลูกค้า"}
      </button>
    </form>
  );
}

export function AdjustPrincipalForm({ contractId }: { contractId: string }) {
  const [state, action, isPending] = useActionState(adjustPrincipalAction, {});
  return (
    <form
      action={action}
      className="flex flex-col gap-2 border border-gray-200 rounded p-3"
    >
      <input type="hidden" name="contractId" value={contractId} />
      <Message state={state} />
      <label className="text-xs font-semibold text-gray-700">
        ปรับเงินต้น (บาท) — ใส่ค่าลบเพื่อลด เช่น -5000.00
      </label>
      <input
        type="text"
        name="deltaBahtStr"
        required
        placeholder="เช่น 5000.00 หรือ -5000.00"
        className="rounded border border-gray-300 px-2 py-1.5 text-xs font-mono"
      />
      <input
        type="text"
        name="note"
        placeholder="หมายเหตุ (ถ้ามี)"
        className="rounded border border-gray-300 px-2 py-1.5 text-xs"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-700 hover:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white disabled:bg-gray-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "ปรับเงินต้น"}
      </button>
    </form>
  );
}

function ApprovalModal({
  title,
  triggerLabel,
  triggerClassName,
  action,
  contractId,
  extraFields,
}: {
  title: string;
  triggerLabel: string;
  triggerClassName: string;
  action: (
    prev: { error?: string; success?: string },
    formData: FormData,
  ) => Promise<{ error?: string; success?: string }>;
  contractId: string;
  extraFields?: React.ReactNode;
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
          {title}
        </h3>
        <Message state={state} />
        <input type="hidden" name="contractId" value={contractId} />
        {extraFields}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Username ผู้อนุมัติ (Checker) *
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
        <p className="text-[10px] text-gray-500 italic">
          * ผู้อนุมัติต้องไม่ใช่คนเดียวกับผู้ทำรายการ (Maker-Checker)
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
            {isPending ? "กำลังดำเนินการ..." : "ยืนยัน"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ForfeitForm({ contractId }: { contractId: string }) {
  return (
    <ApprovalModal
      title="อนุมัติทองหลุด (โอนเข้าสต๊อก)"
      triggerLabel="อนุมัติทองหลุด"
      triggerClassName="rounded bg-red-600 hover:bg-red-700 px-3 py-2 text-xs font-semibold text-white cursor-pointer"
      action={forfeitContractAction}
      contractId={contractId}
    />
  );
}

export function CancelForm({ contractId }: { contractId: string }) {
  return (
    <ApprovalModal
      title="ยกเลิกสัญญาขายฝาก"
      triggerLabel="ยกเลิกสัญญา"
      triggerClassName="rounded border border-red-300 text-red-700 hover:bg-red-50 px-3 py-2 text-xs font-semibold cursor-pointer"
      action={cancelContractAction}
      contractId={contractId}
      extraFields={
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            เหตุผลการยกเลิก *
          </label>
          <textarea
            name="reason"
            required
            rows={2}
            className="rounded border border-gray-300 px-3 py-1.5 text-xs"
          />
        </div>
      }
    />
  );
}
