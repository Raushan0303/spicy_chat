"use server";

import { currentUser } from "@clerk/nextjs/server";
import { DatabaseService } from "@/services/database.service";

/**
 * Helper function to convert Dynamoose model to plain object
 */
function serializeUser(user: any) {
  if (!user) return null;

  // Convert to plain object
  return {
    id: user.id,
    email: user.email || "",
    username: user.username || "",
    picture: user.picture || "",
    tokens: user.tokens || 0,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
}

/**
 * Get user data including profile and database information
 */
export async function getUserData() {
  try {
    // Verify authentication
    const user = await currentUser();

    if (!user) {
      return { success: false, message: "Not authenticated", status: 401 };
    }

    // Get the user from the database
    const dbUser = await DatabaseService.getUserById(user.id);

    // If user doesn't exist in the database, create them
    if (!dbUser) {
      // Create the user in the database
      const newUser = await DatabaseService.getOrCreateUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        username:
          user.firstName ||
          user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
          "user",
        picture: user.imageUrl,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.imageUrl,
          username: newUser.username,
          tokens: newUser.tokens || 0,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.imageUrl,
        username: dbUser.username,
        tokens: dbUser.tokens || 0,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
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
