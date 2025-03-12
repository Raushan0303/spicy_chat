import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the Kinde authentication callback
 * User data will be saved by the server action in layout.tsx
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Auth callback received:", request.url);

    // Let Kinde handle the authentication process
    const response = await handleAuth(request);
    console.log("Authentication successful, redirecting...");

    return response;
  } catch (error) {
    console.error("Auth callback error:", error);
    // Redirect to error page on failure
    return NextResponse.redirect(
      new URL("/auth/error", new URL(request.url).origin)
    );
  }
}
