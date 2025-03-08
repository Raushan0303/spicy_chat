"use client";

import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  LoginLink,
  RegisterLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

export function AuthButton() {
  const { isAuthenticated, user, isLoading } = useKindeAuth();
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Update debug info whenever auth state changes
  useEffect(() => {
    if (!isLoading) {
      const hasAuth = !!isAuthenticated;
      const hasUser = !!user && !!user.id;

      setDebugInfo(
        `Auth: ${hasAuth}, User: ${hasUser}, ID: ${user?.id || "none"}`
      );
      console.log("Auth state:", { isAuthenticated, user, isLoading });
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return (
      <Button variant="default" className="bg-gray-600">
        Loading...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col items-end">
        <LogoutLink>
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            SIGN OUT
          </Button>
        </LogoutLink>
        <div className="text-xs text-gray-500 mt-1">{debugInfo}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <div className="flex gap-2">
        <LoginLink postLoginRedirectURL="/">
          <Button variant="outline" className="text-blue-400 border-blue-400">
            SIGN IN
          </Button>
        </LoginLink>
        <RegisterLink postLoginRedirectURL="/">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            SIGN UP
          </Button>
        </RegisterLink>
      </div>
      <div className="text-xs text-gray-500 mt-1">{debugInfo}</div>
    </div>
  );
}
