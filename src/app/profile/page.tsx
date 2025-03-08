import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { DatabaseService } from "@/services/database.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default async function ProfilePage() {
  // Get the authenticated user from Kinde
  const { getUser, isAuthenticated } = getKindeServerSession();
  const authenticated = await isAuthenticated();

  // Redirect to login if not authenticated
  if (!authenticated) {
    redirect("/api/auth/login?post_login_redirect_url=/profile");
  }

  // Get the user from Kinde
  const kindeUser = await getUser();

  // Redirect if no user found
  if (!kindeUser || !kindeUser.id) {
    redirect("/auth/error?reason=no_user");
  }

  // Get the user from the database
  const dbUser = await DatabaseService.getUserById(kindeUser.id);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>

        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Kinde User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">ID:</p>
              <p>{kindeUser.id}</p>
            </div>
            <div>
              <p className="text-gray-400">Email:</p>
              <p>{kindeUser.email}</p>
            </div>
            <div>
              <p className="text-gray-400">Name:</p>
              <p>
                {kindeUser.given_name} {kindeUser.family_name}
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
              Try signing out and signing in again to create your user record.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Back to Home
            </Button>
          </Link>
          <LogoutLink>
            <Button className="bg-red-600 hover:bg-red-700">Sign Out</Button>
          </LogoutLink>
        </div>
      </div>
    </div>
  );
}
