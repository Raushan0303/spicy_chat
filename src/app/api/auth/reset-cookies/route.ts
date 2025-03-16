import { NextRequest, NextResponse } from "next/server";

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("Reset cookies endpoint called");

    // Get all cookies from the request
    const allCookies = request.cookies.getAll();
    console.log(
      "Current cookies:",
      allCookies.map((c) => c.name)
    );

    // List of auth-related cookies to clear
    const authCookies = [
      "ac-state-key",
      "post_login_redirect_url",
      "kinde_state",
      "kinde_token",
      "kinde_auth",
      "kinde_user",
      "__Secure-next-auth.session-token",
      "__Host-next-auth.csrf-token",
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",
    ];

    console.log("Attempting to clear auth cookies:", authCookies);
    const clearedCookies: string[] = [];
    const paths = ["/", "/api", "/api/auth", "/auth"];

    // Create a response with cleared cookies
    const response = new NextResponse(
      JSON.stringify({
        success: true,
        message: "Auth cookies reset successfully",
        clearedCookies: clearedCookies,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Clear each auth cookie with multiple paths
    authCookies.forEach((cookieName) => {
      paths.forEach((path: string) => {
        // Clear with specific path
        response.cookies.set({
          name: cookieName,
          value: "",
          expires: new Date(0),
          path: path,
          sameSite: "lax",
        });

        clearedCookies.push(`${cookieName} (path: ${path})`);
      });
    });

    console.log("Auth cookies reset successfully:", clearedCookies);
    return response;
  } catch (error) {
    console.error("Error resetting auth cookies:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
