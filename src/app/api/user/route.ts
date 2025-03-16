import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { syncUserWithDatabase } from "@/app/actions/auth";
import { getUserData } from "@/app/actions/user";

export async function GET() {
  try {
    // Get the current user from Clerk
    const user = await currentUser();

    // If no user is authenticated, return unauthorized
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sync user with database
    await syncUserWithDatabase();

    // Get user data from database
    const userData = await getUserData();

    // Return user data
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Error in user API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
