"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import {
  confirmTotpEnrollAction,
  disableTotpAction,
  startTotpEnrollAction,
  type TotpDisableState,
  type TotpEnrollState,
} from "./actions";

export function TotpSection({ enabled }: { enabled: boolean }) {
  return enabled ? <DisableTotp /> : <EnrollTotp />;
}

function EnrollTotp() {
  const [start, setStart] = useState<TotpEnrollState | null>(null);
  const [starting, startTransition] = useTransition();
  const [confirmState, confirmAction, confirming] = useActionState<
    TotpEnrollState,
    FormData
  >(confirmTotpEnrollAction, {});

  if (confirmState.recoveryCodes) {
    return (
      <div className="flex max-w-md flex-col gap-3 rounded border border-green-300 bg-green-50 p-4">
        <h2 className="font-semibold text-green-800">เปิดใช้งาน 2FA สำเร็จ</h2>
        <p className="text-sm">
          เก็บ <strong>recovery codes</strong> เหล่านี้ในที่ปลอดภัย —
          แสดงครั้งเดียวเท่านั้น ใช้แทนรหัส 2FA ได้โค้ดละ 1
          ครั้งเมื่อทำเครื่องหาย
        </p>
        <ul
          data-testid="recovery-codes"
          className="grid grid-cols-2 gap-1 font-mono text-sm"
        >
          {confirmState.recoveryCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      </div>
    );
  }

  const enrollment = start?.enrollment;

  return (
    <div className="flex max-w-md flex-col gap-3 rounded border border-gray-200 p-4">
      <h2 className="font-semibold">2FA (TOTP)</h2>
      <p className="text-sm text-gray-600">
        สถานะ: <span className="text-red-600">ยังไม่เปิดใช้งาน</span> —
        บังคับสำหรับ Owner / ผู้จัดการ / บัญชี / Admin
      </p>

      {!enrollment ? (
        <button
          type="button"
          disabled={starting}
          onClick={() =>
            startTransition(async () => {
              setStart(await startTotpEnrollAction());
            })
          }
          className="self-start rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {starting ? "กำลังสร้าง..." : "เริ่มตั้งค่า 2FA"}
        </button>
      ) : (
        <form action={confirmAction} className="flex flex-col gap-3">
          <p className="text-sm">
            1) สแกน QR ด้วยแอป Authenticator (Google Authenticator, Aegis ฯลฯ)
          </p>
          <Image
            src={enrollment.qrDataUrl}
            alt="TOTP QR Code"
            width={220}
            height={220}
            unoptimized
            className="self-center border border-gray-200"
          />
          <details className="text-xs text-gray-500">
            <summary>สแกนไม่ได้? กรอกด้วยมือ</summary>
            <code data-testid="otpauth-url" className="break-all">
              {enrollment.otpauthUrl}
            </code>
          </details>
          <p className="text-sm">2) กรอกรหัส 6 หลักจากแอปเพื่อยืนยัน</p>
          <input type="hidden" name="secretEnc" value={enrollment.secretEnc} />
          <input
            name="code"
            inputMode="numeric"
            placeholder="000000"
            required
            className="rounded border border-gray-300 px-3 py-2 font-mono text-sm"
          />
          {confirmState.error && (
            <p role="alert" className="text-sm text-red-600">
              {confirmState.error}
            </p>
          )}
          <button
            type="submit"
            disabled={confirming}
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {confirming ? "กำลังยืนยัน..." : "ยืนยันและเปิดใช้งาน"}
          </button>
        </form>
      )}
    </div>
  );
}

function DisableTotp() {
  const [state, formAction, pending] = useActionState<
    TotpDisableState,
    FormData
  >(disableTotpAction, {});

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-3 rounded border border-gray-200 p-4"
    >
      <h2 className="font-semibold">2FA (TOTP)</h2>
      <p className="text-sm text-gray-600">
        สถานะ: <span className="text-green-700">เปิดใช้งานอยู่</span>
      </p>
      <input
        name="password"
        type="password"
        placeholder="ยืนยันรหัสผ่านเพื่อปิด 2FA"
        autoComplete="current-password"
        required
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
        className="self-start rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "กำลังปิด..." : "ปิดใช้งาน 2FA"}
      </button>
    </form>
  );
}
