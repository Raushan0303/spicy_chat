import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function Header() {
  const user = await currentUser();

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="text-xl font-bold">SPICYCHAT.AI</div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-400">
              {user.emailAddresses[0]?.emailAddress}
            </span>
            <Button asChild variant="outline" className="text-gray-400">
              <Link href="/api/auth/logout">Log out</Link>
            </Button>
          </>
        ) : (
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/sign-in">Log in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
