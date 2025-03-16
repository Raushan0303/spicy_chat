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
    console.log("Clear auth state endpoint called");

    // Get all cookies from the request
    const allCookies = request.cookies.getAll();
    console.log(
      "Current cookies:",
      allCookies.map((c) => c.name)
    );

    // Create a response
    const response = NextResponse.json({
      success: true,
      message: "Auth state cleared successfully",
      clearedCookies: [] as string[],
    });

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

    // Clear each auth cookie with multiple paths and domains
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

    // Add the list of cleared cookies to the response
    response.headers.set("X-Cleared-Cookies", JSON.stringify(clearedCookies));

    // Update the response body with the list of cleared cookies
    const updatedResponse = NextResponse.json({
      success: true,
      message: "Auth state cleared successfully",
      clearedCookies: clearedCookies,
    });

    // Copy all the cookies from the original response
    allCookies.forEach((cookie) => {
      if (authCookies.includes(cookie.name)) {
        paths.forEach((path: string) => {
          updatedResponse.cookies.set({
            name: cookie.name,
            value: "",
            expires: new Date(0),
            path: path,
            sameSite: "lax",
          });
        });
      }
    });

    console.log("Auth state cleared successfully:", clearedCookies);
    return updatedResponse;
  } catch (error) {
    console.error("Error clearing auth state:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
