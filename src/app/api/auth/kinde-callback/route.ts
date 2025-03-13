import { NextRequest, NextResponse } from "next/server";
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: NextRequest) {
  console.log("Kinde callback route handler called");

  try {
    // Log environment variables for debugging (redacting sensitive values)
    console.log("Environment variables check:");
    console.log(
      "KINDE_SITE_URL:",
      process.env.KINDE_SITE_URL ? "✓ Set" : "✗ Not set"
    );
    console.log(
      "KINDE_POST_LOGIN_REDIRECT_URL:",
      process.env.KINDE_POST_LOGIN_REDIRECT_URL ? "✓ Set" : "✗ Not set"
    );
    console.log(
      "KINDE_POST_LOGOUT_REDIRECT_URL:",
      process.env.KINDE_POST_LOGOUT_REDIRECT_URL ? "✓ Set" : "✗ Not set"
    );
    console.log(
      "KINDE_CLIENT_ID:",
      process.env.KINDE_CLIENT_ID ? "✓ Set" : "✗ Not set"
    );
    console.log(
      "KINDE_CLIENT_SECRET:",
      process.env.KINDE_CLIENT_SECRET ? "✓ Set" : "✗ Not set"
    );
    console.log(
      "KINDE_ISSUER_URL:",
      process.env.KINDE_ISSUER_URL ? "✓ Set" : "✗ Not set"
    );

    // Log the URL parameters
    const url = new URL(request.url);
    console.log("Callback URL:", url.pathname);
    console.log(
      "Query parameters:",
      Object.fromEntries(url.searchParams.entries())
    );

    // Handle the authentication callback
    const response = await handleAuth(request);

    console.log("Kinde auth handler completed successfully");
    return response;
  } catch (error) {
    console.error("Error in Kinde callback handler:", error);

    // Return a more user-friendly error response
    return NextResponse.json(
      {
        error: "Authentication error",
        message:
          "There was an error processing your authentication. Please try again.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
