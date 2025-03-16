"use server";

import { currentUser } from "@clerk/nextjs/server";
import { DatabaseService } from "@/services/database.service";
import { revalidatePath } from "next/cache";

/**
 * Synchronizes the current user with the database
 * This ensures that the user exists in our database after sign-in/sign-up
 */
export async function syncUserWithDatabase() {
  try {
    console.log("Starting syncUserWithDatabase...");

    // Get the user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      console.log("No Clerk user found, skipping database sync");
      return null;
    }

    console.log("Clerk user found:", clerkUser.id);

    // Create or update user in the database
    try {
      const userData = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        username: clerkUser.username || clerkUser.firstName || "user",
        picture: clerkUser.imageUrl || "",
      };

      console.log("Syncing user with database:", userData);

      const user = await DatabaseService.getOrCreateUser(userData);

      console.log("User synced successfully:", user?.id);

      // Revalidate paths that might show user data
      revalidatePath("/");
      revalidatePath("/settings");
      revalidatePath("/chatbots");
      revalidatePath("/personas");

      return user;
    } catch (error) {
      console.error("Error in database operations:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error syncing user with database:", error);
    return null;
  }
}
