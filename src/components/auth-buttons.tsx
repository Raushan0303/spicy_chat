"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Function to clear all cookies
const clearAllCookies = () => {
  // Get all cookies and split into individual cookies
  const cookies = document.cookie.split(";");

  // For each cookie, set its expiration date to a past date
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

    // Skip clearing certain cookies if needed (e.g., analytics)
    // if (name === "analytics_cookie") continue;

    // Set the cookie to expire in the past
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

    // Also try with different paths to ensure all cookies are cleared
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
  }

  console.log("All cookies have been cleared");
};

export function LoginButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleLogin = () => {
    clearAllCookies();
    // Small delay to ensure cookies are cleared before redirect
    setTimeout(() => {
      router.push("/api/auth/login");
    }, 100);
  };

  return (
    <Button
      onClick={handleLogin}
      className={className || "bg-blue-600 hover:bg-blue-700 transition-colors"}
    >
      Sign In
    </Button>
  );
}

export function SignUpButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleSignUp = () => {
    clearAllCookies();
    // Small delay to ensure cookies are cleared before redirect
    setTimeout(() => {
      router.push("/api/auth/register");
    }, 100);
  };

  return (
    <Button
      onClick={handleSignUp}
      className={
        className ||
        "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors"
      }
    >
      Sign Up
    </Button>
  );
}
