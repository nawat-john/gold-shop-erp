// แนบ request id ให้ทุก request — ใช้เชื่อม log/audit trail ย้อนกลับถึงคำขอต้นทาง
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

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
