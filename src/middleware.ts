import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  // Add auth middleware
  const authResponse = await withAuth(request);

  // If auth response is not a NextResponse, return it as is
  if (!(authResponse instanceof NextResponse)) {
    return authResponse;
  }

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = [
      "http://localhost:3000",
      process.env.NEXT_PUBLIC_APP_URL || "",
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      const response = new NextResponse(authResponse.body, authResponse);
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return response;
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    // Protected routes that require authentication
    "/settings/:path*",
    "/personas/create",
    "/chatbots/create",
    "/api/chatbots/:path*",
    "/api/personas/:path*",
    "/api/images/:path*",
    // Auth routes
    "/api/auth/:path*",
  ],
};
