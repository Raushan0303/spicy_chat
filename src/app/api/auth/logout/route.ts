import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Logout route called");

    // Get the origin for redirects
    const origin = new URL(request.url).origin;

    // Create a response that redirects to the home page
    const response = NextResponse.redirect(origin);

    // List of cookies to clear
    const cookiesToClear = [
      "kinde_token",
      "kinde_auth",
      "__session",
      "auth-token",
      "kinde.auth.token",
      "kinde.auth.state",
      "kinde.auth.code_verifier",
      "kinde.auth.nonce",
      "kinde.auth.redirect_uri",
    ];

    // Clear specific auth cookies in the response
    cookiesToClear.forEach((name) => {
      response.cookies.delete(name);
    });

    // Use Kinde's handleAuth to process the logout
    try {
      await handleAuth(request);
      console.log("Kinde handleAuth for logout completed");
    } catch (kindeError) {
      console.error("Kinde logout error:", kindeError);
      // Continue even if Kinde logout fails
    }

    // Add cache control headers to prevent caching
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    console.log("Redirecting to home page after logout");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, redirect to home
    const response = NextResponse.redirect(
      new URL("/", new URL(request.url).origin)
    );

    // Add cache control headers
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  }
}
