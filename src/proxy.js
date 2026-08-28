import { NextResponse } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/security/csp";

function privatePath(pathname) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/api");
}

export function proxy(request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const headers = new Headers(request.headers);
  headers.set("x-request-id", requestId);
  headers.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), usb=()");

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  if (privatePath(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    response.headers.append("Vary", "Cookie");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

