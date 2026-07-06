"use client";

import { useActionState, useState } from "react";
import {
  setConsentAction,
  anonymizeCustomerAction,
  updateCustomerAction,
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

export function EditCustomerForm({
  customerId,
  name,
  phone,
  address,
  note,
  canViewPii,
}: {
  customerId: string;
  name: string;
  phone: string;
  address: string;
  note: string;
  canViewPii: boolean;
}) {
  const [state, action, isPending] = useActionState(updateCustomerAction, {});

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="customerId" value={customerId} />
      <Message state={state} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">ชื่อ *</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={name}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          เบอร์โทรศัพท์
        </label>
        <input
          type="text"
          name="phone"
          defaultValue={phone}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
      {canViewPii && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            เลขบัตรประชาชน (กรอกใหม่เพื่อแก้ไข — เว้นว่างไว้เพื่อไม่เปลี่ยนแปลง)
          </label>
          <input
            type="text"
            name="citizenId"
            className="rounded border border-gray-300 px-3 py-1.5 text-sm font-mono"
          />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">ที่อยู่</label>
        <textarea
          name="address"
          rows={2}
          defaultValue={address}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">หมายเหตุ</label>
        <textarea
          name="note"
          rows={2}
          defaultValue={note}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-gray-700 hover:bg-gray-800 px-4 py-1.5 text-xs font-semibold text-white disabled:bg-gray-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
      </button>
    </form>
  );
}

export function ConsentToggle({
  customerId,
  hasConsent,
}: {
  customerId: string;
  hasConsent: boolean;
}) {
  const [state, action, isPending] = useActionState(setConsentAction, {});

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="given" value={(!hasConsent).toString()} />
      <Message state={state} />
      <button
        type="submit"
        disabled={isPending}
        className={`self-start rounded px-3 py-1.5 text-xs font-semibold cursor-pointer ${
          hasConsent
            ? "border border-red-300 text-red-700 hover:bg-red-50"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {isPending
          ? "กำลังบันทึก..."
          : hasConsent
            ? "ถอนความยินยอม PDPA"
            : "บันทึกความยินยอม PDPA"}
      </button>
    </form>
  );
}

export function AnonymizeForm({ customerId }: { customerId: string }) {
  const [state, action, isPending] = useActionState(
    anonymizeCustomerAction,
    {},
  );
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="self-start rounded border border-red-300 text-red-700 hover:bg-red-50 px-3 py-1.5 text-xs font-semibold cursor-pointer"
      >
        ล้างข้อมูลส่วนตัว (สิทธิ์ถูกลืม PDPA)
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
          ล้างข้อมูลส่วนตัวลูกค้า
        </h3>
        <p className="text-xs text-gray-500">
          การกระทำนี้จะล้างชื่อ/เบอร์โทร/ที่อยู่/เลขบัตร ปชช. อย่างถาวร
          (ประวัติธุรกรรมยังอยู่)
        </p>
        <Message state={state} />
        <input type="hidden" name="customerId" value={customerId} />
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
            {isPending ? "กำลังดำเนินการ..." : "ยืนยันล้างข้อมูล"}
          </button>
        </div>
      </form>
    </div>
  );
}
