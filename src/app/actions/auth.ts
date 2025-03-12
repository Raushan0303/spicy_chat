"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";

/**
 * Server action to check if the authenticated user exists in our database,
 * and create the user if they don't exist.
 */
export async function syncUserWithDatabase() {
  try {
    // Get the authenticated user from Kinde
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    // If not authenticated, nothing to do
    if (!authenticated) {
      console.log("User is not authenticated, skipping database sync");
      return { success: false, message: "Not authenticated" };
    }

    // Get user data from Kinde
    const kindeUser = await getUser();

    // If no user data, nothing to do
    if (!kindeUser || !kindeUser.id) {
      console.log("No user data available from Kinde");
      return { success: false, message: "No user data" };
    }

    console.log("Checking if user exists in database:", kindeUser.id);

    // Check if user already exists in our database
    const existingUser = await User.get(kindeUser.id).catch(() => null);

    // If user already exists, no need to create
    if (existingUser) {
      console.log("User already exists in database, no action needed");
      return {
        success: true,
        message: "User already exists",
        user: existingUser,
        isNewUser: false,
      };
    }

    // User doesn't exist, create them in our database
    console.log("Creating new user in database:", kindeUser.id);

    const newUser = await User.create({
      id: kindeUser.id,
      email: kindeUser.email || "",
      username:
        kindeUser.given_name ||
        (kindeUser.email ? kindeUser.email.split("@")[0] : "user"),
      picture: kindeUser.picture || "",
      tokens: 0, // Set default tokens
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log("New user created successfully");

    // Revalidate paths that might show user data
    revalidatePath("/");
    revalidatePath("/profile");

    return {
      success: true,
      message: "New user created",
      user: newUser,
      isNewUser: true,
    };
  } catch (error) {
    console.error("Error syncing user with database:", error);
    return {
      success: false,
      message: "Error syncing user",
      error: String(error),
    };
  }
}
