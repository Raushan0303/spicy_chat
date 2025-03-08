import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/character-card";
import { characters } from "@/data/characters";
import { AuthButton } from "@/components/auth/AuthButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="text-xl font-bold">SPICYCHAT.AI</div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="text-blue-400 border-blue-400">
            Create Character
          </Button>
          <Button variant="outline" className="text-gray-400">
            EN
          </Button>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] border-r border-gray-800 p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8V16M8 12H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Chatbots</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 12H16M12 16V8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Chats</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12H12.01M8 12H8.01M16 12H16.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>My Personas</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 16V12M12 8H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Help</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex gap-2 mb-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Include
              </Button>
              <Button variant="outline" className="flex-1">
                Exclude (0)
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-gray-400">
                <span>Male (123)</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Female (12345)</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Romantic (123)</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Female POV (123)</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Dominant (123)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
            {/* Background Image */}
            <Image
              src="/assets/home/hero-banner-1.jpeg"
              alt="Anime couple in autumn scene"
              fill
              className="object-cover"
              priority
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 z-20">
              <h1 className="text-6xl font-bold mb-6">SPICYCHAT</h1>
              <div className="flex gap-3 mb-6">
                <Button
                  variant="outline"
                  className="text-sm bg-black/20 border-white/20 hover:bg-black/40"
                >
                  Romance
                </Button>
                <Button
                  variant="outline"
                  className="text-sm bg-black/20 border-white/20 hover:bg-black/40"
                >
                  Betray
                </Button>
                <Button
                  variant="outline"
                  className="text-sm bg-black/20 border-white/20 hover:bg-black/40"
                >
                  Cold
                </Button>
                <Button
                  variant="outline"
                  className="text-sm bg-black/20 border-white/20 hover:bg-black/40"
                >
                  Loyal
                </Button>
              </div>
              <p className="text-xl mb-6">
                He Knows how to handle your attitude...
              </p>
              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                  Chat Now
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 hover:bg-white/20"
                >
                  Create Character
                </Button>
                <Link href="/auth-test">
                  <Button
                    variant="outline"
                    className="bg-green-600/20 border-green-400/30 hover:bg-green-600/40 text-green-300"
                  >
                    Auth Test
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button
                    variant="outline"
                    className="bg-purple-600/20 border-purple-400/30 hover:bg-purple-600/40 text-purple-300"
                  >
                    Profile
                  </Button>
                </Link>
              </div>
              <div className="mt-4">
                <Link
                  href="/auth/status"
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Check Auth Status
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">For You</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="text-sm">
                Romance
              </Button>
              <Button variant="outline" className="text-sm">
                Betray
              </Button>
              <Button variant="outline" className="text-sm">
                Cold
              </Button>
              <Button variant="outline" className="text-sm">
                Loyal
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
            {characters.map((character, index) => (
              <CharacterCard
                key={index}
                imageUrl={character.imageUrl}
                title={character.title}
                author={character.author}
                stats={character.stats}
                tags={character.tags}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
