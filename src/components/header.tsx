import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "@/components/ui/button";

export async function Header() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="text-xl font-bold">SPICYCHAT.AI</div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-400">{user?.email}</span>
            <Button asChild variant="outline" className="text-gray-400">
              <LogoutLink>Log out</LogoutLink>
            </Button>
          </>
        ) : (
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <LoginLink>Log in</LoginLink>
          </Button>
        )}
      </div>
    </header>
  );
}
