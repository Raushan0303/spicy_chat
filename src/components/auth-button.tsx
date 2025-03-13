"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

const Auth = () => {
  const handleAuthClick = () => {
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });
    console.log("Cookies cleared!");
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
