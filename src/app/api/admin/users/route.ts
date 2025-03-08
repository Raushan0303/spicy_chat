import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// Admin permission check
async function isAdmin(userId: string): Promise<boolean> {
  // In a real app, you would check if the user has admin permissions
  // For now, we'll just check if they're authenticated
  return !!userId;
}

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an admin
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const admin = await isAdmin(user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const lastKey = url.searchParams.get("lastKey");

    // Fetch users from the database
    let query = User.scan();

    // Apply pagination
    if (lastKey) {
      query = query.startAt({ id: lastKey });
    }

    const users = await query.limit(limit).exec();

    // Return the users
    return NextResponse.json({
      users: users,
      count: users.length,
      lastKey: users.length > 0 ? users[users.length - 1].id : null,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 }
    );
  }
}
