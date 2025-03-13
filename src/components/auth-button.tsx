"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

const Auth = () => {
  const clearSpecificCookies = () => {
    // List of cookies to delete explicitly
    const cookiesToDelete = ["ac-state-key", "post_login_redirect_url"];

    // Delete each cookie specifically
    cookiesToDelete.forEach((cookieName) => {
      // Standard path
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

      // With domain attribute to ensure it's removed from correct domain
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;

      // Check if we need to handle parent domain cookies
      const domain = window.location.hostname;
      if (domain.indexOf(".") !== -1) {
        const rootDomain = domain.substring(domain.indexOf("."));
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${rootDomain}`;
      }
    });

    console.log("Specified cookies cleared successfully!");
  };

  const handleAuthClick = () => {
    clearSpecificCookies();
    // Proceed with login or signup logic
  };

  return (
    <>
      <RegisterLink>
        <Button
          onClick={handleAuthClick}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full shadow-lg transition-all duration-300 text-sm md:text-base"
        >
          Sign Up
        </Button>
      </RegisterLink>
      <LoginLink>
        <Button
          onClick={handleAuthClick}
          variant="outline"
          className="bg-black/40 backdrop-blur-sm border-white/30 hover:bg-black/60 hover:border-white/50 rounded-full transition-all duration-300 text-sm md:text-base"
        >
          Log In
        </Button>
      </LoginLink>
    </>
  );
};

export default Auth;
