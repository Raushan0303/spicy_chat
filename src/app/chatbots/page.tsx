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
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  getPublicChatbots,
  getUserChatbots,
  deleteChatbot,
} from "@/app/actions/chatbot";
import Image from "next/image";
import { useState } from "react";
import { DeleteChatbotButton } from "@/components/delete-chatbot-button";
import { DatabaseService } from "@/services/database.service";

// Function to get user's name from their ID
async function getUsernameById(userId: string): Promise<string> {
  try {
    const user = await DatabaseService.getUserById(userId);
    return user?.username || "Unknown User";
  } catch (error) {
    console.error("Error fetching username:", error);
    return "Unknown User";
  }
}

export default async function ChatbotsPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUser() : null;

  // Get public chatbots
  const publicResult = await getPublicChatbots();
  const publicChatbots = publicResult.success
    ? publicResult.chatbots || []
    : [];

  // Get user's chatbots if authenticated
  let userChatbots: any[] = [];
  if (authenticated && user) {
    const userResult = await getUserChatbots();
    userChatbots = userResult.success ? userResult.chatbots || [] : [];
  }

  // Combine chatbots, removing duplicates (a user's public chatbot could appear in both lists)
  const userChatbotIds = new Set(
    userChatbots.map((chatbot: any) => chatbot.id)
  );
  const filteredPublicChatbots = publicChatbots.filter(
    (chatbot: any) => !userChatbotIds.has(chatbot.id)
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
          {authenticated && (
            <Link href="/chatbots/create">
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-md transition-all duration-300">
                Create New Chatbot
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* User's Chatbots Section */}
      {authenticated && userChatbots.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-semibold">Your Chatbots</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {userChatbots.map((chatbot: any) => (
              <Link
                href={`/chatbots/${chatbot.id}`}
                key={chatbot.id}
                className="block transform transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-600/90 to-blue-900/90 backdrop-blur-md p-1">
                  {/* Inner card with slight padding for the glowing effect */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    {/* Background image or gradient with large centered letter */}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      {chatbot.imageUrl ? (
                        <>
                          <Image
                            src={chatbot.imageUrl}
                            alt={chatbot.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/70 to-blue-800/30"></div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-800 to-purple-900 flex items-center justify-center">
                          <span className="text-[120px] font-bold text-white/20">
                            {chatbot.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Heart icon in top left */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className="bg-white/10 backdrop-blur-md rounded-full p-2.5 shadow-lg hover:bg-white/20 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </div>
                    </div>

                    {/* Bookmark button in top right */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-white/10 backdrop-blur-md rounded-full p-2.5 shadow-lg hover:bg-white/20 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>

                    {/* Visibility badge */}
                    <div className="absolute top-3 left-0 right-0 flex justify-center z-10">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-0.5 text-xs text-white">
                        {chatbot.visibility === "public" ? "Public" : "Private"}
                      </div>
                    </div>

                    {/* Chatbot name at bottom center */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
                      <div className="bg-white/10 backdrop-blur-md rounded-full py-2 px-4 shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                            {chatbot.imageUrl ? (
                              <Image
                                src={chatbot.imageUrl}
                                alt={chatbot.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {chatbot.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-white text-sm font-medium">
                            {chatbot.name}
                          </div>
                        </div>
                      </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredPublicChatbots.map((chatbot: any) => (
              <Link
                href={`/chatbots/${chatbot.id}`}
                key={chatbot.id}
                className="block transform transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-600/90 to-blue-900/90 backdrop-blur-md p-1">
                  {/* Inner card with slight padding for the glowing effect */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    {/* Background image or gradient with large centered letter */}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      {chatbot.imageUrl ? (
                        <>
                          <Image
                            src={chatbot.imageUrl}
                            alt={chatbot.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/70 to-blue-800/30"></div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-800 to-purple-900 flex items-center justify-center">
                          <span className="text-[120px] font-bold text-white/20">
                            {chatbot.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Heart icon in top left */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className="bg-white/10 backdrop-blur-md rounded-full p-2.5 shadow-lg hover:bg-white/20 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </div>
                    </div>

                    {/* Bookmark button in top right */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-white/10 backdrop-blur-md rounded-full p-2.5 shadow-lg hover:bg-white/20 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>

                    {/* Public badge */}
                    <div className="absolute top-3 left-0 right-0 flex justify-center z-10">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-0.5 text-xs text-white">
                        Public
                      </div>
                    </div>

                    {/* Chatbot name at bottom center */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
                      <div className="bg-white/10 backdrop-blur-md rounded-full py-2 px-4 shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                            {chatbot.imageUrl ? (
                              <Image
                                src={chatbot.imageUrl}
                                alt={chatbot.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {chatbot.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-white text-sm font-medium">
                            {chatbot.name}
                          </div>
                        </div>
                      </div>
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
            {authenticated
              ? "You haven't created any chatbots yet, and there are no public chatbots available."
              : "There are no public chatbots available yet."}
          </p>
          {authenticated ? (
            <Link href="/chatbots/create">
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-md transition-all duration-300">
                Create Your First Chatbot
              </Button>
            </Link>
          ) : (
            <Link href="/api/auth/login">
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-md transition-all duration-300">
                Sign In to Create Chatbots
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
