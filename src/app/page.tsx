import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getPublicChatbots } from "@/app/actions/chatbot";
import { LoginButton, SignUpButton } from "@/components/auth-buttons";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();
  const authenticated = await isAuthenticated();

  // Get a few chatbots to feature
  const publicResult = await getPublicChatbots();
  const featuredChatbots = publicResult.success
    ? (publicResult.chatbots || []).slice(0, 5)
    : [];

  return (
    <main className="px-4 py-6 md:px-6 max-w-screen-2xl mx-auto">
      {/* Hero Section - Reduced height and improved styling */}
      <div className="relative h-[350px] md:h-[400px] rounded-xl overflow-hidden mb-12 shadow-xl">
        {/* Background Image with improved quality */}
        <Image
          src="/assets/home/hero-banner-1.jpeg"
          alt="Anime couple in autumn scene"
          fill
          className="object-cover object-center scale-105 animate-subtle-zoom"
          priority
          quality={90}
        />

        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10" />

        {/* Content with improved spacing and typography */}
        <div className="absolute bottom-0 left-0 p-6 md:p-8 z-20 w-full md:max-w-2xl animate-fade-in">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            SPICYCHAT
          </h1>

          <div
            className="flex flex-wrap gap-2 mb-4 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button
              variant="outline"
              className="text-xs md:text-sm bg-black/30 border-white/30 hover:bg-black/50 hover:border-white/50 rounded-full transition-all"
            >
              Romance
            </Button>
            <Button
              variant="outline"
              className="text-xs md:text-sm bg-black/30 border-white/30 hover:bg-black/50 hover:border-white/50 rounded-full transition-all"
            >
              Betray
            </Button>
            <Button
              variant="outline"
              className="text-xs md:text-sm bg-black/30 border-white/30 hover:bg-black/50 hover:border-white/50 rounded-full transition-all"
            >
              Cold
            </Button>
            <Button
              variant="outline"
              className="text-xs md:text-sm bg-black/30 border-white/30 hover:bg-black/50 hover:border-white/50 rounded-full transition-all"
            >
              Loyal
            </Button>
          </div>

          <p
            className="text-base md:text-xl mb-6 text-gray-200 max-w-lg animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            Create and chat with AI personalities with unique personas and
            immersive experiences...
          </p>

          <div
            className="flex gap-3 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            {authenticated ? (
              <>
                <Link href="/chatbots">
                  <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full shadow-lg transition-all duration-300 text-sm md:text-base">
                    Browse Chatbots
                  </Button>
                </Link>
                <Link href="/chatbots/create">
                  <Button
                    variant="outline"
                    className="bg-black/40 backdrop-blur-sm border-white/30 hover:bg-black/60 hover:border-white/50 rounded-full transition-all duration-300 text-sm md:text-base"
                  >
                    Create Chatbot
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <SignUpButton className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full shadow-lg transition-all duration-300 text-sm md:text-base" />
                <LoginButton className="bg-black/40 backdrop-blur-sm border-white/30 hover:bg-black/60 hover:border-white/50 rounded-full transition-all duration-300 text-sm md:text-base" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Featured Chatbots Section */}
      {featuredChatbots.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Chatbots</h2>
            <Link href="/chatbots">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {/* Chatbot Cards with the same design as the chatbots page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredChatbots.map((chatbot: any) => (
              <Link
                href={
                  authenticated
                    ? `/chatbots/${chatbot.id}`
                    : "/api/auth/login?post_login_redirect_url=/chatbots"
                }
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
        </section>
      )}

      {/* New Section: How It Works */}
      <div className="mb-16 mt-16 relative px-2">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 rounded-2xl -z-10 blur-xl"></div>

        <h2 className="text-2xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          How SpicyChat Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 text-center hover:border-gray-700 transition-colors hover:shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-400 text-xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Create a Persona</h3>
            <p className="text-gray-400 text-sm">
              Define personality traits, tone, and expertise for your AI
              character
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 text-center hover:border-gray-700 transition-colors hover:shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-400 text-xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Build Your Chatbot</h3>
            <p className="text-gray-400 text-sm">
              Customize your chatbot with a name, description, and optional
              image
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 text-center hover:border-gray-700 transition-colors hover:shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-400 text-xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Chatting</h3>
            <p className="text-gray-400 text-sm">
              Engage in immersive conversations with your custom AI characters
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
