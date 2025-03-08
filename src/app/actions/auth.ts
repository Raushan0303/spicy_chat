"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server action to completely log out a user by clearing all cookies
 * and redirecting to the home page
 */
export async function serverLogout() {
  console.log("Server logout action called");

  try {
    // Get the cookie store
    const cookieStore = cookies();

    // List of known auth cookies to clear
    const authCookies = [
      "kinde_token",
      "kinde_auth",
      "__session",
      "auth-token",
      "kinde.auth.token",
      "kinde.auth.state",
      "kinde.auth.code_verifier",
      "kinde.auth.nonce",
      "kinde.auth.redirect_uri",
      "kinde_token_type",
      "kinde_access_token",
      "kinde_id_token",
      "kinde_refresh_token",
    ];

    // Clear all known auth cookies
    for (const cookieName of authCookies) {
      cookieStore.set(cookieName, "", {
        expires: new Date(0),
        path: "/",
        maxAge: 0,
      });
    }

    console.log("Cleared auth cookies");
  } catch (error) {
    console.error("Error clearing cookies:", error);
  }

  // Redirect to home page
  redirect("/?logout=true");
}

/**
 * Check if any authentication cookies exist
 */
export async function checkAuth() {
  const cookieStore = cookies();
  const authCookies = [
    "kinde_token",
    "kinde_auth",
    "__session",
    "auth-token",
    "kinde.auth.token",
    "kinde.auth.state",
  ];

  // Check if any auth cookies exist
  for (const cookieName of authCookies) {
    if (cookieStore.has(cookieName)) {
      return { hasAuthCookies: true, cookieName };
    }
  }

  return { hasAuthCookies: false };
}
