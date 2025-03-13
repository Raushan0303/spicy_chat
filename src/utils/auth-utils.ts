import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function requireAuth(req: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser();
  return user;
}

/**
 * Utility functions for authentication
 */

/**
 * Clears all authentication-related cookies
 */
export function clearAuthCookies(): void {
  if (typeof document === "undefined") return; // Only run in browser

  // Get all cookies
  const cookies = document.cookie.split(";");

  // Clear each cookie by setting its expiration date to the past
  cookies.forEach((cookie) => {
    const [name] = cookie.trim().split("=");
    if (name) {
      // Clear for root path
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      // Also clear for other common paths
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/auth;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api;`;
    }
  });
}

/**
 * Redirects to the login page
 */
export function redirectToLogin(postLoginRedirect?: string): void {
  if (typeof window === "undefined") return; // Only run in browser

  let loginUrl = "/api/auth/login";

  // Add post-login redirect if provided
  if (postLoginRedirect) {
    loginUrl += `?post_login_redirect_url=${encodeURIComponent(
      postLoginRedirect
    )}`;
  }

  window.location.href = loginUrl;
}

/**
 * Handles authentication errors by clearing cookies and redirecting
 */
export function handleAuthError(error: any, redirectPath?: string): void {
  console.error("Authentication error:", error);

  // Clear all auth cookies
  clearAuthCookies();

  // Redirect to login
  redirectToLogin(redirectPath || window.location.pathname);
}
