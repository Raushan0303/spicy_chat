"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearAuthCookies } from "@/utils/auth-utils";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    // Clear all authentication cookies
    clearAuthCookies();

    // Set up countdown for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/api/auth/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-800">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-white">
          Authentication Error
        </h1>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
          <p className="text-red-400 font-medium">{error || "Unknown error"}</p>
          {errorDescription && (
            <p className="text-gray-400 text-sm mt-2">{errorDescription}</p>
          )}
        </div>

        <p className="text-gray-300 mb-6">
          There was a problem with your authentication session. This could be
          due to an expired session, browser cookies, or a security feature.
        </p>

        <p className="text-gray-400 mb-6">
          You will be redirected to the login page in{" "}
          <span className="text-white font-bold">{countdown}</span> seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/api/auth/login")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In Now
          </Button>

          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-gray-700 hover:bg-gray-800"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
