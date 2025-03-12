"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getUserData } from "../actions/user";
import {
  getUserChatbots,
  toggleChatbotVisibility,
  deleteChatbot,
} from "../actions/chatbot";
import { UserAvatar } from "@/components/user-avatar";
import { SettingsChatbotCard } from "@/components/settings-chatbot-card";
import { toast } from "react-hot-toast";

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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user data
        const userResult = await getUserData();
        if (!userResult.success) {
          if (userResult.status === 401) {
            return redirect(
              "/api/auth/login?post_login_redirect_url=/settings"
            );
          }
          throw new Error(userResult.message);
        }

        if (userResult.user) {
          setUserData(userResult.user as UserData);
        }

        // Fetch user's chatbots
        const chatbotsResult = await getUserChatbots();
        if (chatbotsResult.success && chatbotsResult.chatbots) {
          // Convert the response to the expected Chatbot[] type
          const typedChatbots = Array.isArray(chatbotsResult.chatbots)
            ? chatbotsResult.chatbots.map((chatbot: any) => ({
                id: chatbot.id,
                name: chatbot.name,
                description: chatbot.description,
                imageUrl: chatbot.imageUrl,
                visibility: chatbot.visibility,
                createdAt: chatbot.createdAt,
                interactions: chatbot.interactions || 0,
              }))
            : [];
          setChatbots(typedChatbots);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
                    Chatbots
                  </Button>
                </Link>
                <div className="pt-4 mt-4 border-t border-gray-700/50">
                  <LogoutLink
                    postLogoutRedirectURL="/"
                    className="block w-full"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all duration-300"
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
                  </LogoutLink>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Manage Your Chatbots
            </h1>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <p className="text-gray-400">
                View, manage, and control your AI chatbots
              </p>
              <Link href="/chatbots/create">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all duration-300 px-5">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New Chatbot
                </Button>
              </Link>
            </div>

            {chatbots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chatbots.map((chatbot) => (
                  <SettingsChatbotCard
                    key={chatbot.id}
                    chatbot={chatbot}
                    onVisibilityToggle={handleVisibilityToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-xl p-8 text-center shadow-xl">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-blue-400"
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
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  No Chatbots Yet
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't created any chatbots yet. Create your first one to
                  start building your AI personality collection!
                </p>
                <Link href="/chatbots/create">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg shadow-lg transition-all duration-300 px-6 py-2 text-lg">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Your First Chatbot
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
