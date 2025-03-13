"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { LoginButton, SignUpButton } from "@/components/auth-buttons";

interface ConditionalHeaderProps {
  user: any;
  isAuthenticated: boolean;
}

export function ConditionalHeader({
  user,
  isAuthenticated,
}: ConditionalHeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (!isHomePage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:px-6 border-b border-gray-800 bg-black/95 backdrop-blur-sm">
      <div className="flex items-center">
        <Link
          href="/"
          className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
        >
          SPICYCHAT.AI
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/chatbots/create" className="hidden sm:block">
          <Button
            variant="outline"
            className="text-blue-400 border-blue-400 hover:bg-blue-400/10 rounded-full px-4 py-1 h-auto text-sm"
          >
            Create Chatbot
          </Button>
        </Link>
        <Button
          variant="outline"
          className="text-gray-400 hover:bg-gray-700 rounded-full px-3 py-1 h-auto min-w-[40px] text-sm"
        >
          EN
        </Button>

        <div>
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <LoginButton className="text-sm text-gray-300 hover:text-blue-400 transition-colors px-3 py-1.5" />
              <SignUpButton className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full transition-colors" />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-800/70 hover:bg-gray-800 transition-colors px-3 py-1.5 rounded-full">
              {user?.picture ? (
                <UserAvatar
                  src={user.picture}
                  alt={user.given_name || "User"}
                  fallback={user.given_name?.charAt(0) || "U"}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
                  {user?.given_name?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-medium">
                {user?.given_name || "Account"}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
