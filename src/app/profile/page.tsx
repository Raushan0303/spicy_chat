import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DatabaseService } from "@/services/database.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { syncUserWithDatabase } from "../actions/auth";

export default async function ProfilePage() {
  // Get the authenticated user from Clerk
  const user = await currentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/sign-in?redirect_url=/profile");
  }

  // Sync user with database first
  await syncUserWithDatabase();

  // Get the user from the database
  const dbUser = await DatabaseService.getUserById(user.id);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>

        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Clerk User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">ID:</p>
              <p>{user.id}</p>
            </div>
            <div>
              <p className="text-gray-400">Email:</p>
              <p>{user.emailAddresses[0]?.emailAddress}</p>
            </div>
            <div>
              <p className="text-gray-400">Name:</p>
              <p>
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
        </div>

        {dbUser ? (
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Database User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Username:</p>
                <p>{dbUser.username}</p>
              </div>
              <div>
                <p className="text-gray-400">Tokens:</p>
                <p>{dbUser.tokens}</p>
              </div>
              <div>
                <p className="text-gray-400">Created At:</p>
                <p>{new Date(dbUser.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Updated At:</p>
                <p>{new Date(dbUser.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Database User Not Found
            </h2>
            <p>
              Your user information was not found in the database. This could
              happen if:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>This is your first login and the database save failed</li>
              <li>There was an error connecting to the database</li>
              <li>Your user record was deleted</li>
            </ul>
            <p>
              Try refreshing the page or signing out and signing in again to
              create your user record.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 mr-2 mt-2"
            >
              Refresh Page
            </Button>
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Back to Home
            </Button>
          </Link>
          <Link href="/api/auth/logout">
            <Button className="bg-red-600 hover:bg-red-700">Sign Out</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
