import { getUserPersonas } from "@/app/actions/persona";
import { createChatbot } from "@/app/actions/chatbot";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";
import { CreateChatbotForm } from "@/components/create-chatbot-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquareText } from "lucide-react";

export default async function CreateChatbotPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUser() : null;

  // If not authenticated, show a friendly message instead of immediate redirect
  if (!authenticated) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Sign in to Create a Chatbot
            </CardTitle>
            <CardDescription>
              Build your own AI assistant with custom personalities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-300">
              You need to be signed in to create your own custom chatbots. Sign
              in to get started with building your AI assistant.
            </p>
            <div className="flex gap-4">
              <Link href="/api/auth/login?post_login_redirect_url=/chatbots/create">
                <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
                  Sign In
                </Button>
              </Link>
              <Link href="/chatbots">
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  Browse Chatbots
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's personas for the form
  const personasResult = await getUserPersonas();
  const personas = personasResult.success ? personasResult.personas || [] : [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Create a New Chatbot
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Design your custom AI assistant by selecting a persona and configuring
          its settings.
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Link href="/chatbots">
          <Button
            variant="outline"
            className="border-gray-700 hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chatbots
          </Button>
        </Link>
      </div>

      <CreateChatbotForm personas={personas} />
    </div>
  );
}
