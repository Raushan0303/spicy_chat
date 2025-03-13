import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

const STATE_COOKIE_NAME = "kinde_state";

async function handleSession(request: NextRequest) {
  const response = NextResponse.next();

  // For auth callback, verify state
  if (request.nextUrl.pathname.endsWith("/kinde_callback")) {
    const state = request.nextUrl.searchParams.get("state");
    const storedState = request.cookies.get(STATE_COOKIE_NAME)?.value;

    if (!state || !storedState || state !== storedState) {
      return NextResponse.json(
        { error: "Invalid state parameter" },
        { status: 400 }
      );
    }

    // Clear state after verification
    response.cookies.delete(STATE_COOKIE_NAME);
  }

  // For auth initiation, store state
  if (request.nextUrl.pathname.startsWith("/api/auth/login")) {
    const state = Math.random().toString(36).substring(2);
    response.cookies.set(STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}

export default withAuth(handleSession);

export const config = {
  matcher: ["/api/auth/:path*", "/api/chatbots/:path*", "/api/personas/:path*"],
};
