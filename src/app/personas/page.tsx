import Link from "next/link";
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import { getUserPersonas } from "@/app/actions/persona";
import { syncUserWithDatabase } from "@/app/actions/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PlusCircle,
  Sparkles,
  Brain,
  MessageSquare,
  Palette,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function PersonasPage() {
  // Get the current user from Clerk
  const user = await currentUser();

  // Sync user with database if authenticated
  if (user) {
    await syncUserWithDatabase();
  }

  // If not authenticated, show a friendly message instead of immediate redirect
  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Sign in to View Your Personas
            </CardTitle>
            <CardDescription>
              Create and manage custom personalities for your AI chatbots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-300">
              You need to be signed in to view and manage your personas. Sign in
              to get started with creating unique AI personalities.
            </p>
            <div className="flex gap-4">
              <Link href="/sign-in?redirect_url=/personas">
                <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
                  Sign In
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's personas
  const personasResult = await getUserPersonas();
  const personas = personasResult.success ? personasResult.personas || [] : [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          AI Personas
        </h1>
        <p className="text-gray-400 max-w-2xl mb-8">
          Personas define the personality, tone, and expertise of your chatbots.
          Create multiple personas to give your AI assistants different
          personalities and specialized knowledge.
        </p>
        <Link href="/personas/create">
          <Button className="bg-blue-600 hover:bg-blue-700 transition-all py-6 px-8 text-lg font-medium shadow-lg shadow-blue-900/20 group">
            <PlusCircle className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
            Create New Persona
          </Button>
        </Link>
      </div>

      {personas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {personas.map((persona: any) => (
            <Card
              key={persona.id}
              className="bg-gray-900/60 border-gray-800 overflow-hidden group hover:border-gray-700 transition-all duration-300 shadow-xl backdrop-blur-sm flex flex-col"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {persona.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{persona.name}</CardTitle>
                    {persona.tone && (
                      <CardDescription className="flex items-center gap-1">
                        <Palette className="h-3 w-3" />
                        {persona.tone}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-grow">
                <p className="text-sm text-gray-300">
                  {persona.description || "No description provided"}
                </p>

                {persona.traits && persona.traits.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1.5 text-xs text-gray-400 font-medium">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Traits</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.traits.map((trait: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-gray-800/80 hover:bg-gray-800 text-gray-300 border-none"
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {persona.style && (
                  <div>
                    <div className="flex items-center gap-1 mb-1.5 text-xs text-gray-400 font-medium">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Communication Style</span>
                    </div>
                    <Badge className="bg-gray-800/80 hover:bg-gray-800 text-gray-300 border-none">
                      {persona.style}
                    </Badge>
                  </div>
                )}

                {persona.expertise && persona.expertise.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1.5 text-xs text-gray-400 font-medium">
                      <Brain className="h-3.5 w-3.5" />
                      <span>Expertise</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.expertise.map((exp: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-blue-900/30 hover:bg-blue-900/40 text-blue-300 border-blue-800/30"
                        >
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <div className="px-6 pb-6 mt-auto">
                <Link href={`/chatbots/create?personaId=${persona.id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-all h-10 font-medium">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Use in Chatbot
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm shadow-xl text-center">
          <CardContent className="pt-10 pb-10 px-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gray-800/80 flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-gray-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No Personas Found</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                You haven't created any personas yet. Create your first persona
                to define how your AI chatbots will interact.
              </p>
              <Link href="/personas/create">
                <Button className="bg-blue-600 hover:bg-blue-700 transition-all py-6 px-8 text-lg font-medium shadow-lg shadow-blue-900/20">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Your First Persona
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
