"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserData } from "../actions/user";
import {
  getUserChatbots,
  toggleChatbotVisibility,
  deleteChatbot,
} from "../actions/chatbot";
import { UserAvatar } from "@/components/user-avatar";
import { SettingsChatbotCard } from "@/components/settings-chatbot-card";
import { toast } from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { syncUserWithDatabase } from "../actions/auth";

// Types for our data
type UserData = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
  username?: string | null;
  tokens: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type Chatbot = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: "public" | "private";
  createdAt: string;
  interactions?: number;
};

export default function SettingsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not signed in
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/settings");
      return;
    }

    if (!isLoaded) return;

    async function fetchData() {
      try {
        console.log("Starting to fetch user data...");

        // Sync user with database first
        await syncUserWithDatabase();
        console.log("User synced with database");

        // Fetch user data
        const userResult = await getUserData();
        console.log("User data result:", userResult);

        if (!userResult.success) {
          if (userResult.status === 401) {
            router.push("/sign-in?redirect_url=/settings");
            return;
          }
          throw new Error(userResult.message);
        }

        if (userResult.user) {
          // Create a clean copy of the user data to avoid serialization issues
          const cleanUserData = {
            id: userResult.user.id || "",
            email: userResult.user.email || "",
            firstName: userResult.user.firstName || null,
            lastName: userResult.user.lastName || null,
            picture: userResult.user.picture || null,
            username: userResult.user.username || null,
            tokens: userResult.user.tokens || 0,
            createdAt: userResult.user.createdAt || null,
            updatedAt: userResult.user.updatedAt || null,
          };

          console.log("Setting user data:", cleanUserData);
          setUserData(cleanUserData);
        } else {
          console.error("No user data returned");
          setError("No user data available");
        }

        // Fetch user's chatbots
        const chatbotsResult = await getUserChatbots();
        console.log("Chatbots result:", chatbotsResult);

        if (chatbotsResult.success && chatbotsResult.chatbots) {
          // Convert the response to the expected Chatbot[] type
          const typedChatbots = Array.isArray(chatbotsResult.chatbots)
            ? chatbotsResult.chatbots.map((chatbot: any) => ({
                id: chatbot.id || "",
                name: chatbot.name || "",
                description: chatbot.description || "",
                imageUrl: chatbot.imageUrl || "",
                visibility: chatbot.visibility || "private",
                createdAt: chatbot.createdAt || new Date().toISOString(),
                interactions: chatbot.interactions || 0,
              }))
            : [];
          console.log("Setting chatbots:", typedChatbots);
          setChatbots(typedChatbots);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          `Failed to load user data: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoaded, isSignedIn, router]);

  // Handle chatbot visibility toggle
  const handleVisibilityToggle = async (
    chatbotId: string,
    newVisibility: "public" | "private"
  ) => {
    try {
      const result = await toggleChatbotVisibility(chatbotId, newVisibility);
      if (result.success) {
        // Update the local state
        setChatbots(
          chatbots.map((chatbot) =>
            chatbot.id === chatbotId
              ? { ...chatbot, visibility: newVisibility }
              : chatbot
          )
        );
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(result.message));
      }
    } catch (error) {
      console.error("Error toggling chatbot visibility:", error);
      return Promise.reject(error);
    }
  };

  // Handle chatbot deletion
  const handleDelete = async (chatbotId: string) => {
    try {
      const result = await deleteChatbot(chatbotId);
      if (result.success) {
        // Update the local state
        setChatbots(chatbots.filter((chatbot) => chatbot.id !== chatbotId));
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(result.message));
      }
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      return Promise.reject(error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading your settings...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-300 mb-4">
            {error || "Unable to load your settings"}
          </p>
          <Button
            onClick={() => router.refresh()}
            className="bg-blue-600 hover:bg-blue-700 mr-2"
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 sticky top-20 border border-gray-700/50 shadow-xl">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 overflow-hidden rounded-full ring-2 ring-blue-500/50 ring-offset-2 ring-offset-gray-900 shadow-lg mb-3">
                  <UserAvatar
                    src={userData.picture}
                    alt={userData.firstName || "User"}
                    fallback={
                      userData.firstName?.charAt(0) ||
                      userData.email.charAt(0).toUpperCase()
                    }
                    className="w-20 h-20"
                  />
                </div>
                <h2 className="text-xl font-semibold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-gray-400 text-sm">{userData.email}</p>
              </div>

              <div className="space-y-2 mt-6">
                <Link href="/settings" className="block w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 rounded-xl transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </Button>
                </Link>
                <Link href="/chatbots" className="block w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-gray-700/50 rounded-xl transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    My Chatbots
                  </Button>
                </Link>
                <Link href="/personas" className="block w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-gray-700/50 rounded-xl transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Personas
                  </Button>
                </Link>
                <Link href="/sign-out" className="block w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-red-900/30 hover:text-red-300 rounded-xl transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl mb-8">
              <h1 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">
                Account Settings
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-3">Profile</h2>
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <div className="mb-3">
                      <label className="block text-gray-400 text-sm mb-1">
                        Name
                      </label>
                      <div className="text-white">
                        {userData.firstName} {userData.lastName}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-400 text-sm mb-1">
                        Email
                      </label>
                      <div className="text-white">{userData.email}</div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-400 text-sm mb-1">
                        Username
                      </label>
                      <div className="text-white">
                        {userData.username || "Not set"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-3">Account</h2>
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <div className="mb-3">
                      <label className="block text-gray-400 text-sm mb-1">
                        Tokens
                      </label>
                      <div className="text-white flex items-center">
                        <span className="text-xl font-bold text-blue-400 mr-2">
                          {userData.tokens}
                        </span>
                        <span className="text-gray-400 text-sm">
                          available tokens
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-400 text-sm mb-1">
                        Account Created
                      </label>
                      <div className="text-white">
                        {userData.createdAt
                          ? new Date(userData.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-400 text-sm mb-1">
                        Last Updated
                      </label>
                      <div className="text-white">
                        {userData.updatedAt
                          ? new Date(userData.updatedAt).toLocaleDateString()
                          : "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chatbots section */}
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">
                  My Chatbots
                </h2>
                <Link href="/chatbots/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create New
                  </Button>
                </Link>
              </div>

              {chatbots.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <h3 className="text-xl font-medium mb-2">No chatbots yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Create your first chatbot to start having conversations with
                    your own AI characters.
                  </p>
                  <Link href="/chatbots/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Your First Chatbot
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chatbots.map((chatbot) => (
                    <SettingsChatbotCard
                      key={chatbot.id}
                      chatbot={chatbot}
                      onVisibilityToggle={handleVisibilityToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
