"use client";

import { useActionState, useState, useTransition } from "react";
import { createCustomerAction, readIdCardAction } from "../actions";

export function NewCustomerForm() {
  const [state, action, isPending] = useActionState(createCustomerAction, {});
  const [isReading, startReading] = useTransition();
  const [name, setName] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [address, setAddress] = useState("");

  function handleReadIdCard() {
    startReading(async () => {
      const result = await readIdCardAction();
      setName(result.name);
      setCitizenId(result.citizenId);
      setAddress(result.address ?? "");
    });
  }

  return (
    <form action={action} className="flex flex-col gap-4">
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

      <button
        type="button"
        onClick={handleReadIdCard}
        disabled={isReading}
        className="self-start rounded border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 cursor-pointer"
      >
        {isReading ? "กำลังอ่านบัตร..." : "อ่านบัตรประชาชน (เครื่องอ่านจำลอง)"}
      </button>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">ชื่อ *</label>
        <input
          type="text"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          เบอร์โทรศัพท์
        </label>
        <input
          type="text"
          name="phone"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          เลขบัตรประชาชน
        </label>
        <input
          type="text"
          name="citizenId"
          value={citizenId}
          onChange={(e) => setCitizenId(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          placeholder="เก็บแบบเข้ารหัส (AES-256-GCM)"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">ที่อยู่</label>
        <textarea
          name="address"
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">หมายเหตุ</label>
        <textarea
          name="note"
          rows={2}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 mt-2 disabled:bg-amber-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "ลงทะเบียนลูกค้า"}
      </button>
    </form>
  );
}
