import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Log the request path to help with debugging
  console.log("Middleware processing path:", request.nextUrl.pathname);

  // For the Kinde callback URL, we want to ensure cookies are properly handled
  if (request.nextUrl.pathname.startsWith("/api/auth/kinde_callback")) {
    console.log("Processing Kinde callback");

    // Check for error parameters in the URL
    const url = new URL(request.url);
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // If there's an error, redirect to our custom error page
    if (error) {
      console.log("Authentication error detected:", error);
      const errorUrl = new URL("/auth-error", request.url);
      errorUrl.searchParams.set("error", error);
      if (errorDescription) {
        errorUrl.searchParams.set("error_description", errorDescription);
      }
      return NextResponse.redirect(errorUrl);
    }

    // Get all cookies from the request
    const cookies = request.cookies.getAll();
    console.log("Cookies present:", cookies.map((c) => c.name).join(", "));

    // Let the request continue to be handled by the Kinde SDK
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (
    request.nextUrl.pathname.startsWith("/chatbots") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/personas/create")
  ) {
    const { isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/api/auth/login", request.url);
      loginUrl.searchParams.set(
        "post_login_redirect_url",
        request.nextUrl.pathname
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure the paths that this middleware should run on
export const config = {
  matcher: [
    // Apply this middleware to these paths
    "/api/auth/kinde_callback",
    "/chatbots/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/personas/create",
  ],
};
