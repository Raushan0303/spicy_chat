import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database.service";

// Define the Kinde user type
type KindeUser = {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export async function GET(request: NextRequest) {
  try {
    console.log("Auth callback URL:", request.url);

    // Use Kinde's handleAuth to process the authentication
    const authResponse = await handleAuth(request);
    console.log("Auth response received");

    // Extract user data from auth response
    if (authResponse && typeof authResponse === "object") {
      try {
        // The user object is nested in the auth response
        const user = (authResponse as any).user as KindeUser;

        if (user && user.id && user.email) {
          console.log("Saving user to database:", user.id);

          // Save user to database using your DatabaseService
          await DatabaseService.getOrCreateUser({
            id: user.id,
            email: user.email,
            username: user.given_name || user.email.split("@")[0],
            picture: user.picture,
          });

          console.log("User saved to database successfully");
        } else {
          console.warn("User data is incomplete:", user);
        }
      } catch (dbError) {
        console.error("Error saving user to database:", dbError);
        // Continue even if database save fails
      }
    }

    // Redirect to home page on success
    return NextResponse.redirect(new URL("/", new URL(request.url).origin));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/error", new URL(request.url).origin)
    );
  }
}
