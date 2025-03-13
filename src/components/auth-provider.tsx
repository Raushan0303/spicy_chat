"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookies, redirectToLogin } from "@/utils/auth-utils";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  useEffect(() => {
    // Check for authentication errors in the URL
    const url = new URL(window.location.href);
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      console.error("Authentication error:", error, errorDescription);

      // If there's a state mismatch error, clear cookies and redirect to login
      if (
        error === "invalid_request" &&
        errorDescription?.includes("State mismatch")
      ) {
        console.log(
          "State mismatch detected, clearing session and redirecting to login"
        );

        // Clear all cookies related to authentication
        clearAuthCookies();

        // Redirect to login after a short delay
        setTimeout(() => {
          redirectToLogin();
        }, 500);
      }
    }
  }, [router]);

  return <>{children}</>;
}
