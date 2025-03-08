"use client";

import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthTestPage() {
  const { isAuthenticated, user, isLoading } = useKindeAuth();
  const [refreshCount, setRefreshCount] = useState(0);

  // Force refresh of auth state every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount((prev) => prev + 1);
      console.log("Refreshing auth state check...");
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Log auth state on each refresh
  useEffect(() => {
    console.log("Current auth state:", {
      isAuthenticated,
      user,
      isLoading,
      refreshCount,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, user, isLoading, refreshCount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 bg-gray-900 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">
          Authentication Test
        </h1>

        <div className="mb-6 p-4 bg-gray-800 rounded-md">
          <h2 className="text-xl font-semibold text-white mb-2">
            Real-time Auth State
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">Loading:</div>
            <div className="text-white">{isLoading ? "Yes" : "No"}</div>

            <div className="text-gray-400">Authenticated:</div>
            <div className="text-white font-semibold">
              {isLoading ? "Loading..." : isAuthenticated ? "Yes ✅" : "No ❌"}
            </div>

            <div className="text-gray-400">User ID:</div>
            <div className="text-white">{user?.id || "Not available"}</div>

            <div className="text-gray-400">Refresh Count:</div>
            <div className="text-white">{refreshCount}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">Home</Button>
            </Link>

            <Link href="/auth/status">
              <Button className="bg-green-600 hover:bg-green-700">
                Auth Status
              </Button>
            </Link>
          </div>

          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/api/auth/logout">
                <Button className="bg-red-600 hover:bg-red-700">
                  Sign Out
                </Button>
              </Link>
            ) : (
              <Link href="/api/auth/login?post_login_redirect_url=/auth/test">
                <Button className="bg-green-600 hover:bg-green-700">
                  Sign In
                </Button>
              </Link>
            )}

            <Button
              onClick={() => setRefreshCount((prev) => prev + 1)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Refresh Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
