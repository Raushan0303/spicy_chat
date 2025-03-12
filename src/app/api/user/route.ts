import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await getUser();

    return NextResponse.json({
      user: {
        id: user?.id,
        email: user?.email,
        given_name: user?.given_name,
        family_name: user?.family_name,
        picture: user?.picture,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
