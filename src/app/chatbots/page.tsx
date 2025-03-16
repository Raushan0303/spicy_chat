import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import { syncUserWithDatabase } from "@/app/actions/auth";
import {
  getPublicChatbots,
  getUserChatbots,
  deleteChatbot,
} from "@/app/actions/chatbot";
import Image from "next/image";
import { useState } from "react";
import { DeleteChatbotButton } from "@/components/delete-chatbot-button";

// Define a type for chatbot objects
interface Chatbot {
  id: string;
  name: string;
  imageUrl?: string;
  visibility?: string;
  userId?: string;
  [key: string]: any; // Allow for other properties
}

// Function to get user's name from their ID
async function getUsernameById(userId: string): Promise<string> {
  try {
    // Use a simple fetch to the user API instead of direct database access
    const response = await fetch(`/api/user/${userId}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return "Unknown User";
    }

    const userData = await response.json();
    return userData?.username || "Unknown User";
  } catch (error) {
    console.error("Error fetching username:", error);
    return "Unknown User";
  }
}

export default async function ChatbotsPage() {
  // Get the current user from Clerk
  const user = await currentUser();

  // Sync user with database if authenticated
  if (user) {
    await syncUserWithDatabase();
  }

  // Get public chatbots
  const publicResult = await getPublicChatbots();
  const publicChatbots: Chatbot[] = publicResult.success
    ? ((publicResult.chatbots || []).filter(Boolean) as Chatbot[])
    : [];

  // Get user's chatbots if authenticated
  let userChatbots: Chatbot[] = [];
  if (user) {
    const userResult = await getUserChatbots();
    userChatbots = userResult.success
      ? ((userResult.chatbots || []).filter(Boolean) as Chatbot[])
      : [];
  }

  // Combine chatbots, removing duplicates (a user's public chatbot could appear in both lists)
  const userChatbotIds = new Set(userChatbots.map((chatbot) => chatbot.id));
  const filteredPublicChatbots = publicChatbots.filter(
    (chatbot) => !userChatbotIds.has(chatbot.id)
  );

  // Get usernames for public chatbots
  const chatbotUsernames = new Map<string, string>();
  for (const chatbot of filteredPublicChatbots) {
    if (
      chatbot &&
      typeof chatbot === "object" &&
      "userId" in chatbot &&
      chatbot.userId &&
      typeof chatbot.userId === "string"
    ) {
      const username = await getUsernameById(chatbot.userId);
      chatbotUsernames.set(chatbot.userId, username);
    }
  }

  return (
    <div className="px-4 py-6 md:px-6 max-w-screen-2xl mx-auto">
      {/* Header with gradient background */}
      <div className="relative mb-10 pb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10 rounded-2xl -z-10 blur-xl"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Chatbots
            </h1>
            <p className="text-gray-400 mt-1">
              Discover and chat with AI personalities
            </p>
          </div>
          {user && (
            <Link href="/chatbots/create">
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-md transition-all duration-300">
                Create New Chatbot
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* User's Chatbots Section */}
      {user && userChatbots.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-semibold">Your Chatbots</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {userChatbots.map((chatbot) => (
              <Link
                href={`/chatbots/${chatbot.id}`}
                key={chatbot.id}
                className="block transform transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-950 rounded-xl overflow-hidden border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
                  {/* Image container with overlay */}
                  <div className="aspect-[3/2] relative overflow-hidden">
                    {chatbot.imageUrl ? (
                      <img
                        src={chatbot.imageUrl}
                        alt={chatbot.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white/20">
                          {chatbot.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent opacity-70 group-hover:opacity-60 transition-opacity duration-300"></div>

                    {/* Floating badge */}
                    <div className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full text-white font-medium">
                      {chatbot.visibility === "public" ? "Public" : "Private"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-semibold mb-1 text-white group-hover:text-blue-400 transition-colors truncate">
                      {chatbot.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                      {chatbot.description || "No description provided"}
                    </p>

                    {/* Footer with author and action */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs text-white font-bold mr-1.5">
                          {(user.username || user.firstName?.charAt(0) || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500 truncate max-w-[60px]">
                          You
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600/90 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs h-auto"
                      >
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Public Chatbots Section */}
      {filteredPublicChatbots.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-semibold">Public Chatbots</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredPublicChatbots.map((chatbot) => (
              <Link
                href={`/chatbots/${chatbot.id}`}
                key={chatbot.id}
                className="block transform transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-950 rounded-xl overflow-hidden border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
                  {/* Image container with overlay */}
                  <div className="aspect-[3/2] relative overflow-hidden">
                    {chatbot.imageUrl ? (
                      <img
                        src={chatbot.imageUrl}
                        alt={chatbot.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white/20">
                          {chatbot.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent opacity-70 group-hover:opacity-60 transition-opacity duration-300"></div>

                    {/* Floating badge */}
                    <div className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full text-white font-medium">
                      Public
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-semibold mb-1 text-white group-hover:text-blue-400 transition-colors truncate">
                      {chatbot.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                      {chatbot.description || "No description provided"}
                    </p>

                    {/* Footer with author and action */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs text-white font-bold mr-1.5">
                          {(chatbot.username || "A").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500 truncate max-w-[60px]">
                          {chatbotUsernames.get(chatbot.userId || "") ||
                            "Anonymous"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600/90 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs h-auto"
                      >
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No Chatbots Message */}
      {userChatbots.length === 0 && filteredPublicChatbots.length === 0 && (
        <div className="text-center py-16 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Chatbots Found</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {user
              ? "You haven't created any chatbots yet, and there are no public chatbots available."
              : "There are no public chatbots available yet."}
          </p>
          {user && (
            <Link href="/chatbots/create">
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-md transition-all duration-300">
                Create Your First Chatbot
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
