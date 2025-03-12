"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { DatabaseService } from "@/services/database.service";

/**
 * Get user data including profile and database information
 */
export async function getUserData() {
  try {
    // Verify authentication
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return { success: false, message: "Not authenticated", status: 401 };
    }

    const kindeUser = await getUser();
    if (!kindeUser || !kindeUser.id) {
      return { success: false, message: "User not found", status: 404 };
    }

    // Get the user from the database
    const dbUser = await DatabaseService.getUserById(kindeUser.id);

    return {
      success: true,
      user: {
        id: kindeUser.id,
        email: kindeUser.email,
        firstName: kindeUser.given_name,
        lastName: kindeUser.family_name,
        picture: kindeUser.picture,
        username: dbUser?.username,
        tokens: dbUser?.tokens || 0,
        createdAt: dbUser?.createdAt,
        updatedAt: dbUser?.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      success: false,
      message: "Failed to fetch user data",
      status: 500,
    };
  }
}
