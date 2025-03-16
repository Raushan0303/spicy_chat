"use client";

import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl">
        <h1 className="text-2xl font-bold mb-6">Signing Out...</h1>
        <p className="text-gray-300 mb-8">
          You are being signed out of your account.
        </p>
        <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Click here if you're not redirected
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
