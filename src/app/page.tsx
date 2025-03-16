import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getPublicChatbots } from "@/app/actions/chatbot";
import { syncUserWithDatabase } from "./actions/auth";

export default async function Home() {
  // Get the current user from Clerk
  const user = await currentUser();

  // Sync user with database if authenticated
  if (user) {
    await syncUserWithDatabase();
  }

  // Get a few chatbots to feature
  const chatbotsResult = await getPublicChatbots();
  const featuredChatbots = chatbotsResult.success
    ? chatbotsResult.chatbots?.slice(0, 3) || []
    : [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto ">
        {/* Hero section with background image */}
        <div className="relative rounded-3xl overflow-hidden mb-20">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/home/hero-banner-1.jpeg"
              alt="Hero background"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-20 px-4">
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
              style={{ animationDelay: "0.1s" }}
            >
              Chat with AI Characters
            </h1>
            <p
              className="text-xl text-gray-200 max-w-3xl mb-10 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Create and chat with custom AI personalities. Design unique
              characters with specific traits, knowledge, and communication
              styles.
            </p>
            <div
              className="flex flex-wrap gap-4 justify-center animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              {user ? (
                <>
                  <Link href="/chatbots">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:scale-105">
                      Explore Chatbots
                    </Button>
                  </Link>
                  <Link href="/chatbots/create">
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-900/20 px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                      Create New Chatbot
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:scale-105">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-900/20 px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Featured chatbots section */}
        {featuredChatbots.length > 0 && (
          <div className="mb-20 px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Featured Chatbots
              </h2>
              <Link href="/chatbots">
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-900/20 rounded-full"
                >
                  See All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {featuredChatbots.map((chatbot: any) => (
                <div
                  key={chatbot.id}
                  className="group relative bg-gradient-to-br from-gray-900/80 to-gray-950 rounded-xl overflow-hidden border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
                >
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
                      AI Character
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
                          {chatbot.username || "Anonymous"}
                        </span>
                      </div>
                      <Link
                        href={
                          user
                            ? `/chatbots/${chatbot.id}`
                            : "/sign-in?redirect_url=/chatbots"
                        }
                      >
                        <Button
                          size="sm"
                          className="bg-blue-600/90 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs h-auto"
                        >
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features section */}
        <div className="mb-20 px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Create Your Own AI Characters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="group bg-gradient-to-br from-gray-900/80 via-gray-900 to-gray-950 p-6 md:p-8 rounded-2xl border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                Customize Personalities
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Define traits, expertise, tone, and communication style to
                create unique AI characters that reflect your imagination.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-900/80 via-gray-900 to-gray-950 p-6 md:p-8 rounded-2xl border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-blue-400"
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
              <h3 className="text-xl md:text-2xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                Natural Conversations
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Chat with AI characters that remember your conversation history
                and respond naturally with contextual awareness.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-900/80 via-gray-900 to-gray-950 p-6 md:p-8 rounded-2xl border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                Generate Images
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Create stunning visual representations of your characters using
                advanced AI image generation technology.
              </p>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="text-center px-4 py-10 mb-10 bg-gradient-to-r from-gray-900 to-gray-950 rounded-3xl border border-gray-800/50">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Ready to Create Your Own AI Character?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Sign up now and start creating unique AI personalities for
            storytelling, role-playing, or just having fun conversations.
          </p>
          {!user && (
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20">
                Get Started for Free
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
