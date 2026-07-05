// 1) แนบ request id ให้ทุก request — ใช้เชื่อม log/audit trail ย้อนกลับถึงคำขอต้นทาง
// 2) กันเข้า /admin โดยไม่มี session cookie (เช็คแบบถูก — edge ไม่มี DB)
//    การตรวจ session จริง + permission อยู่ที่ server layer เสมอ (deny-by-default)
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "gold_session"; // ซ้ำกับ session.service — middleware import โค้ดฝั่ง node ไม่ได้

export function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.cookies.has(SESSION_COOKIE_NAME)
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  // ข้าม static assets ของ Next
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
