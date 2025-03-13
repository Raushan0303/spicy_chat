import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth-buttons";

export async function Header() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUser() : null;

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="text-xl font-bold">SPICYCHAT.AI</div>
      <div className="flex items-center gap-4">
        {authenticated ? (
          <>
            <span className="text-sm text-gray-400">{user?.email}</span>
            <Button asChild variant="outline" className="text-gray-400">
              <LogoutLink>Log out</LogoutLink>
            </Button>
          </>
        ) : (
          <LoginButton className="bg-blue-600 hover:bg-blue-700" />
        )}
      </div>
    </header>
  );
}
