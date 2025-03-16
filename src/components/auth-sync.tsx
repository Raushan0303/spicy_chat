"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { syncUserWithDatabase } from "@/app/actions/auth";

export function AuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    // Only run this effect when the user is signed in
    if (isLoaded && isSignedIn && user) {
      // Sync the user with the database
      syncUserWithDatabase();
    }
  }, [isLoaded, isSignedIn, user]);

  // This component doesn't render anything
  return null;
}
