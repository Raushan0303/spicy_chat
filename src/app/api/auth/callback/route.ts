import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the Kinde authentication callback
 * User data will be saved by the server action in layout.tsx
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Auth callback received:", request.url);

    console.log("Authentication successful, redirecting...");

    // Manually set the redirect URL
    const redirectUrl = new URL("/", new URL(request.url).origin);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Auth callback error:", error);

    // Redirect to error page on failure
    return NextResponse.redirect(
      new URL("/auth/error", new URL(request.url).origin)
    );
  }
}
