"use client";

import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type DatabaseUser = {
  id: string;
  email: string;
  username: string;
  picture?: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
};

export default function AuthStatusPage() {
  const { isAuthenticated, user, isLoading } = useKindeAuth();
  const [cookies, setCookies] = useState<string>("");
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Get all cookies for debugging
    setCookies(document.cookie);
  }, []);

  // Fetch user from database when authenticated
  useEffect(() => {
    const fetchUserFromDb = async () => {
      if (isAuthenticated && user?.id) {
        setDbLoading(true);
        setDbError(null);

        try {
          const response = await fetch(`/api/users/${user.id}`);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch user: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();
          setDbUser(data);
        } catch (error) {
          console.error("Error fetching user from database:", error);
          setDbError(error instanceof Error ? error.message : "Unknown error");
        } finally {
          setDbLoading(false);
        }
      }
    };

    fetchUserFromDb();
  }, [isAuthenticated, user?.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 bg-gray-900 rounded-lg max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-white mb-6">
          Authentication Status
        </h1>

        <div className="mb-6 p-4 bg-gray-800 rounded-md">
          <h2 className="text-xl font-semibold text-white mb-2">Auth State</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">Loading:</div>
            <div className="text-white">{isLoading ? "Yes" : "No"}</div>

            <div className="text-gray-400">Authenticated:</div>
            <div className="text-white font-semibold">
              {isLoading ? "Loading..." : isAuthenticated ? "Yes ✅" : "No ❌"}
            </div>
          </div>
        </div>

        {!isLoading && isAuthenticated && user && (
          <div className="mb-6 p-4 bg-gray-800 rounded-md">
            <h2 className="text-xl font-semibold text-white mb-2">
              User Information (Kinde)
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">User ID:</div>
              <div className="text-white">{user.id || "Not available"}</div>

              <div className="text-gray-400">Email:</div>
              <div className="text-white">{user.email || "Not available"}</div>

              <div className="text-gray-400">Name:</div>
              <div className="text-white">
                {user.given_name
                  ? `${user.given_name} ${user.family_name || ""}`
                  : "Not available"}
              </div>
            </div>
          </div>
        )}

        {!isLoading && isAuthenticated && (
          <div className="mb-6 p-4 bg-gray-800 rounded-md">
            <h2 className="text-xl font-semibold text-white mb-2">
              Database Record
            </h2>

            {dbLoading && (
              <div className="text-blue-400 text-sm mb-2">
                Loading database record...
              </div>
            )}

            {dbError && (
              <div className="text-red-400 text-sm mb-2">Error: {dbError}</div>
            )}

            {dbUser && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Database ID:</div>
                <div className="text-white">{dbUser.id}</div>

                <div className="text-gray-400">Username:</div>
                <div className="text-white">{dbUser.username}</div>

                <div className="text-gray-400">Email:</div>
                <div className="text-white">{dbUser.email}</div>

                <div className="text-gray-400">Tokens:</div>
                <div className="text-white">{dbUser.tokens}</div>

                <div className="text-gray-400">Created:</div>
                <div className="text-white">
                  {new Date(dbUser.createdAt).toLocaleString()}
                </div>

                <div className="text-gray-400">Updated:</div>
                <div className="text-white">
                  {new Date(dbUser.updatedAt).toLocaleString()}
                </div>
              </div>
            )}

            {!dbLoading && !dbError && !dbUser && (
              <div className="text-yellow-400 text-sm">
                No database record found. Try signing out and signing in again.
              </div>
            )}
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-800 rounded-md">
          <h2 className="text-xl font-semibold text-white mb-2">Cookies</h2>
          <div className="text-xs text-gray-400 break-all whitespace-pre-wrap">
            {cookies || "No cookies found"}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Return to Home
            </Button>
          </Link>

          <Link href="/auth/test">
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              Auth Test
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/api/auth/logout">
                <Button className="bg-red-600 hover:bg-red-700">
                  Sign Out
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Admin Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/api/auth/login?post_login_redirect_url=/auth/status">
              <Button className="bg-green-600 hover:bg-green-700">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
