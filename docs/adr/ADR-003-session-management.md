# ADR-003: Session Management — สร้างเอง (DB-backed) แทน Auth.js

- **สถานะ:** Accepted (2026-07-05)
- **บริบท:** แผนเดิม (ADR-001) ระบุ Auth.js (NextAuth v5) credentials + TOTP แต่ข้อกำหนด security ของแผนบังคับ: revoke session ได้จากหน้า admin, idle timeout 30 นาที + absolute timeout 12 ชม. บังคับฝั่ง server

## ปัญหา

NextAuth v5 กับ credentials provider **รองรับเฉพาะ JWT session strategy** (ข้อจำกัดที่ทีม NextAuth ตั้งใจ) — JWT stateless ทำให้:

1. **Revoke ทันทีไม่ได้** — token ที่ออกไปแล้วใช้ได้จนหมดอายุ
2. Idle timeout ฝั่ง server ทำได้ยาก (ต้อง re-issue token ทุก request)
3. ขัดหลัก "Audit Everything" — ไม่มีทะเบียน session ให้ตรวจว่าใคร login ค้างที่เครื่องไหน

## การตัดสินใจ

เขียน session management เองใน `src/server/services/session.service.ts`:

- Token: `randomBytes(32)` base64url ใน httpOnly + Secure + SameSite=Lax cookie
- DB เก็บเฉพาะ **SHA-256 hash** ของ token (ตาราง `sessions`) — DB หลุดก็ปลอม session ไม่ได้
- ทุก request ตรวจกับ DB: revoked? / absolute 12 ชม.? / idle 30 นาที? / user ยัง active?
- `lastSeenAt` อัปเดตแบบ throttle (> 1 นาที) ลด write load
- `revokeSession` / `revokeAllUserSessions` สำหรับหน้า admin, reset รหัสผ่าน

## ทางเลือกที่ตัดทิ้ง

- **NextAuth v5** — ข้อจำกัด JWT ข้างต้น; ส่วน adapter+database session ใช้ได้เฉพาะ OAuth provider
- **Lucia** — ผู้พัฒนาประกาศเลิก maintain เป็น library (เหลือเป็นเอกสารแนะนำให้ DIY ซึ่งคือแนวทางที่เราทำ)
- **iron-session** — เป็น stateless encrypted cookie เจอปัญหา revoke แบบเดียวกับ JWT

## ผลกระทบ

- ต้องดูแล security ของ session เอง → ชดเชยด้วย integration tests ครอบทุก timeout/revoke path
- 2FA TOTP ใช้ otplib ตรง ๆ (ไม่ผูกกับ NextAuth) — โค้ดตรงไปตรงมากว่า
- middleware Next.js ตรวจแค่ "มี cookie" (edge ไม่มี DB) — การตรวจจริงอยู่ที่ server layer ทุก action/route (deny-by-default)
