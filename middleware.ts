import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Allow large uploads only on upload endpoints
  if (request.nextUrl.pathname.startsWith("/api/upload")) {
    const response = NextResponse.next()
    // Set headers to allow large uploads
    response.headers.set("x-middleware-request-size", "unlimited")
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/upload/:path*"],
}
