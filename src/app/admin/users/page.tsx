"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

type User = {
  id: string;
  email: string;
  username: string;
  picture?: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUsersPage() {
  const { isAuthenticated, isLoading } = useKindeAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/users");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch users: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setUsers(data.users);
        setLastKey(data.lastKey);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, isLoading]);

  const loadMore = async () => {
    if (!lastKey) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users?lastKey=${lastKey}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch more users: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setUsers((prev) => [...prev, ...data.users]);
      setLastKey(data.lastKey);
    } catch (error) {
      console.error("Error fetching more users:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="p-8 bg-gray-900 rounded-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You need to be logged in to access this page.
          </p>
          <Link href="/api/auth/login">
            <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <Link href="/">
            <Button variant="outline" className="border-gray-600 text-gray-300">
              Back to Home
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-800">
            <h2 className="text-xl font-semibold text-white">Users</h2>
          </div>

          {loading && users.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No users found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="p-3 text-left text-gray-300 font-semibold">
                        Username
                      </th>
                      <th className="p-3 text-left text-gray-300 font-semibold">
                        Email
                      </th>
                      <th className="p-3 text-left text-gray-300 font-semibold">
                        Tokens
                      </th>
                      <th className="p-3 text-left text-gray-300 font-semibold">
                        Created
                      </th>
                      <th className="p-3 text-left text-gray-300 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-gray-800 hover:bg-gray-800/50"
                      >
                        <td className="p-3 text-white">
                          <div className="flex items-center">
                            {user.picture && (
                              <img
                                src={user.picture}
                                alt={user.username}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                            )}
                            {user.username}
                          </div>
                        </td>
                        <td className="p-3 text-gray-300">{user.email}</td>
                        <td className="p-3 text-gray-300">{user.tokens}</td>
                        <td className="p-3 text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {lastKey && (
                <div className="p-4 border-t border-gray-800 text-center">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="border-gray-700 text-gray-300"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
