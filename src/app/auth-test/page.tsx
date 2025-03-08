"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { refreshAuthState, clearAuthCookies } from "@/utils/auth";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function AuthTestPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cookies, setCookies] = useState<string>("");

  useEffect(() => {
    // Get all cookies for debugging
    setCookies(document.cookie);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (!response.ok) {
          throw new Error(`Failed to check auth: ${response.status}`);
        }
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleClearCookies = () => {
    clearAuthCookies();
    setCookies(document.cookie);
    refreshAuthState();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 bg-gray-900 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">
          Authentication Test
        </h1>

        {loading ? (
          <div className="text-white">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="mb-6 p-4 bg-gray-800 rounded-md">
            <h2 className="text-xl font-semibold text-white mb-2">
              Auth State
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Authenticated:</div>
              <div className="text-white font-semibold">
                {isAuthenticated ? "Yes ✅" : "No ❌"}
              </div>

              {user && (
                <>
                  <div className="text-gray-400">User ID:</div>
                  <div className="text-white">{user.id || "Not available"}</div>

                  <div className="text-gray-400">Email:</div>
                  <div className="text-white">
                    {user.email || "Not available"}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-800 rounded-md">
          <h2 className="text-xl font-semibold text-white mb-2">Cookies</h2>
          <div className="text-xs text-gray-400 break-all whitespace-pre-wrap">
            {cookies || "No cookies found"}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">Home</Button>
            </Link>

            <Button
              onClick={refreshAuthState}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Refresh State
            </Button>
          </div>

          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <LogoutLink>
                <Button className="bg-red-600 hover:bg-red-700">
                  Sign Out
                </Button>
              </LogoutLink>
            ) : (
              <Link href="/api/auth/login">
                <Button className="bg-green-600 hover:bg-green-700">
                  Sign In
                </Button>
              </Link>
            )}

            <Button
              onClick={handleClearCookies}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Clear Cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
