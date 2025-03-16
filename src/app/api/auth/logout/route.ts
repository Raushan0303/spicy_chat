import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Logout endpoint called");

    // Create a response that will redirect to the sign-in page
    const response = NextResponse.redirect(new URL("/sign-in", request.url));

    // Get all cookies from the request
    const cookies = request.cookies.getAll();
    console.log(
      "Cookies found on server:",
      cookies.map((c) => c.name)
    );

    // Clear each cookie by setting it to expire in the past
    cookies.forEach((cookie) => {
      // Skip cookies that start with next- as they're needed for Next.js functionality
      if (cookie.name.startsWith("next-")) {
        return;
      }

      console.log(`Clearing cookie on server: ${cookie.name}`);

      // Set the cookie to expire in the past
      response.cookies.set({
        name: cookie.name,
        value: "",
        expires: new Date(0),
        path: "/",
        sameSite: "lax",
      });
    });

    // Specifically target known auth cookies
    const knownAuthCookies = [
      "__session",
      "__client",
      "ac-state-key",
      "post_login_redirect_url",
    ];

    console.log("Clearing known auth cookies on server");
    knownAuthCookies.forEach((cookieName) => {
      response.cookies.set({
        name: cookieName,
        value: "",
        expires: new Date(0),
        path: "/",
        sameSite: "lax",
      });
    });

    console.log("Logout complete, redirecting to sign-in page");
    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
