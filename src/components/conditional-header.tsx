"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function ConditionalHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { user, isLoaded } = useUser();
  const isAuthenticated = isLoaded && !!user;

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
              <SignInButton mode="modal">
                <button className="text-sm text-gray-300 hover:text-blue-400 transition-colors px-3 py-1.5 cursor-pointer">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full cursor-pointer transition-colors">
                  Sign up
                </button>
              </SignUpButton>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-800/70 hover:bg-gray-800 transition-colors px-3 py-1.5 rounded-full">
              {user?.imageUrl ? (
                <UserAvatar
                  src={user.imageUrl}
                  alt={user.firstName || "User"}
                  fallback={user.firstName?.charAt(0) || "U"}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-medium">
                {user?.firstName || "Account"}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
