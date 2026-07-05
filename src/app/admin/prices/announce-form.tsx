"use client";

import { useActionState } from "react";
import {
  announcePriceAction,
  manualFeedAction,
  type PriceFormState,
} from "./actions";

interface Defaults {
  barBuy: string;
  barSell: string;
  ornamentBuy: string;
  ornamentSell: string;
}

const FIELDS: { name: keyof Defaults; label: string }[] = [
  { name: "barBuy", label: "แท่ง รับซื้อ (บาท)" },
  { name: "barSell", label: "แท่ง ขายออก (บาท)" },
  { name: "ornamentBuy", label: "รูปพรรณ รับซื้อ (บาท)" },
  { name: "ornamentSell", label: "รูปพรรณ ขายออก (บาท)" },
];

function PriceInputs({ defaults }: { defaults: Defaults | null }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FIELDS.map((f) => (
        <label key={f.name} className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">{f.label}</span>
          <input
            name={f.name}
            inputMode="decimal"
            required
            defaultValue={defaults?.[f.name] ?? ""}
            className="rounded border border-gray-300 px-3 py-2 font-mono text-sm"
          />
        </label>
      ))}
    </div>
  );
}

export function AnnouncePriceForm({
  defaults,
  basedOnFeedId,
}: {
  defaults: Defaults | null;
  basedOnFeedId: string | null;
}) {
  const [state, formAction, pending] = useActionState<PriceFormState, FormData>(
    announcePriceAction,
    {},
  );

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-3 rounded border border-gray-200 p-4"
    >
      <h2 className="font-semibold">ประกาศราคาหน้าร้าน</h2>
      {basedOnFeedId && (
        <>
          <p className="text-xs text-gray-500">
            ค่าเริ่มต้นดึงจาก feed ล่าสุด — ปรับก่อนประกาศได้
          </p>
          <input type="hidden" name="basedOnFeedId" value={basedOnFeedId} />
        </>
      )}
      <PriceInputs defaults={defaults} />
      <input
        name="note"
        placeholder="หมายเหตุ (ไม่บังคับ)"
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-green-700">{state.success}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "กำลังประกาศ..." : "ประกาศราคา"}
      </button>
    </form>
  );
}

export function ManualFeedForm() {
  const [state, formAction, pending] = useActionState<PriceFormState, FormData>(
    manualFeedAction,
    {},
  );

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-3 rounded border border-dashed border-gray-300 p-4"
    >
      <h2 className="font-semibold">กรอกราคา feed มือ (เมื่อ feed สมาคมล่ม)</h2>
      <PriceInputs defaults={null} />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-green-700">{state.success}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-amber-600 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
      >
        {pending ? "กำลังบันทึก..." : "บันทึกราคา feed มือ"}
      </button>
    </form>
  );
}
