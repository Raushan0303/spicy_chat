import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { getSession, verifyState } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");

  // If this is a callback with state, verify it
  if (state && request.nextUrl.pathname.endsWith("/kinde_callback")) {
    const isValidState = await verifyState(state);
    if (!isValidState) {
      return NextResponse.json(
        { error: "Invalid state parameter" },
        { status: 400 }
      );
    }
  }

  // Get the session
  const session = await getSession();

  // Handle the auth request
  const response = NextResponse.next();
  const authResponse = await handleAuth()(request, response);

  // If this is a successful login
  if (
    authResponse.status === 302 &&
    authResponse.headers.get("location")?.includes("/api/auth/kinde_callback")
  ) {
    // Update session
    session.isLoggedIn = true;
    await session.save();
  }

  return authResponse;
}
