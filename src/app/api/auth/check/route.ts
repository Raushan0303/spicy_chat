import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();

    const authenticated = await isAuthenticated();
    const user = authenticated ? await getUser() : null;

    return NextResponse.json({
      isAuthenticated: authenticated,
      user: user,
    });
  } catch (error) {
    console.error("Error checking auth:", error);
    return NextResponse.json(
      { error: "Failed to check authentication" },
      { status: 500 }
    );
  }
}
