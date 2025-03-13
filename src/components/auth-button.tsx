"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

const Auth = () => {
  const clearAllCookies = () => {
    // Get all cookies
    const cookies = document.cookie.split(";");

    // For each cookie found
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // Delete the cookie by setting expired date in the past
      // Important: handle both root path and all potential subpaths
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

      // Also clear for potential subdomains by setting domain to root
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;

      // If you're on a subdomain and need to clear parent domain cookies
      const domain = window.location.hostname;
      if (domain.indexOf(".") !== -1) {
        const rootDomain = domain.substring(domain.indexOf("."));
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${rootDomain}`;
      }
    }

    console.log("All cookies cleared successfully!");
  };

  const handleAuthClick = () => {
    clearAllCookies();
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
