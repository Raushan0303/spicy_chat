import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: Request) {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();
    const authenticated = await isAuthenticated();
    const user = authenticated ? await getUser() : null;

    // Log authentication status and cookies for debugging
    console.log("Authentication status:", authenticated);
    console.log("User:", user ? { id: user.id, email: user.email } : null);

    // Get cookies from the request
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    console.log("Cookies:", cookies);

    return NextResponse.json({
      authenticated,
      user: user
        ? {
            id: user.id,
            email: user.email,
            given_name: user.given_name,
            family_name: user.family_name,
            picture: user.picture,
          }
        : null,
      cookies: cookies.length,
    });
  } catch (error) {
    console.error("Error in auth-status route:", error);
    return NextResponse.json(
      { error: "Failed to check authentication status" },
      { status: 500 }
    );
  }
}
