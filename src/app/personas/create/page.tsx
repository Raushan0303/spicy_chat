import { createPersona } from "@/app/actions/persona";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Brain,
  MessageSquare,
  Sparkles,
  Palette,
  ArrowLeft,
  Save,
  HelpCircle,
  UserCircle,
  ImageIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/image-uploader";

export default async function CreatePersonaPage() {
  const { isAuthenticated } = getKindeServerSession();
  const authenticated = await isAuthenticated();

  // If not authenticated, show a friendly message instead of immediate redirect
  if (!authenticated) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Sign in to Create a Persona
            </CardTitle>
            <CardDescription>
              Design custom personalities for your AI chatbots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-300">
              You need to be signed in to create your own custom personas. Sign
              in to get started with creating unique AI personalities.
            </p>
            <div className="flex gap-4">
              <Link href="/api/auth/login?post_login_redirect_url=/personas/create">
                <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
                  Sign In
                </Button>
              </Link>
              <Link href="/personas">
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  Browse Personas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Client action to handle form submission
  async function handleCreatePersona(formData: FormData) {
    "use server";

    // Extract form values
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const traitsInput = formData.get("traits") as string;
    const traits = traitsInput
      ? traitsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const tone = formData.get("tone") as string;
    const style = formData.get("style") as string;
    const expertiseInput = formData.get("expertise") as string;
    const expertise = expertiseInput
      ? expertiseInput
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
      : [];

    // Handle image - either from file upload or generated image
    const imageFile = formData.get("image") as File;
    const generatedImageUrl = formData.get("generatedImageUrl") as string;
    let imageUrl = "";

    // If we have a generated image URL, use that
    if (generatedImageUrl && generatedImageUrl.trim() !== "") {
      imageUrl = generatedImageUrl;
    }
    // Otherwise, try to upload the file if provided
    else if (imageFile && imageFile.size > 0) {
      // Create a new FormData to send the image file
      const imageFormData = new FormData();
      imageFormData.append("file", imageFile);

      try {
        // Upload the image
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        } else {
          console.error("Failed to upload image:", await uploadResponse.text());
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    // Create the persona
    const result = await createPersona({
      name,
      description,
      traits,
      tone,
      style,
      expertise,
      imageUrl, // Add the image URL to the persona
    });

    if (result.success && result.persona) {
      // Check if the user wants to create a chatbot with this persona
      const createChatbot = formData.get("createChatbot") === "on";

      if (createChatbot) {
        // Redirect to create chatbot page with this persona
        redirect(`/chatbots/create?personaId=${result.persona.id}`);
      } else {
        // Redirect to personas list
        redirect("/personas");
      }
    } else {
      // For simplicity, we're not handling errors in the UI in this example
      console.error("Error creating persona:", result.message);
      redirect(
        "/personas/create?error=" +
          encodeURIComponent(result.message || "Unknown error")
      );
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Create a New Persona
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Design a unique personality for your AI chatbot by defining its
          traits, tone, and areas of expertise.
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Link href="/personas">
          <Button
            variant="outline"
            className="border-gray-700 hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Personas
          </Button>
        </Link>
      </div>

      <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-blue-400" />
            Persona Details
          </CardTitle>
          <CardDescription>
            Fill in the details below to create your custom AI personality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreatePersona} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Persona Name <span className="text-red-500">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Give your persona a descriptive name that reflects
                            its purpose or personality
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Friendly Teacher, Sci-Fi Expert"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Provide a detailed description of your
                            persona&apos;s background, knowledge, and purpose
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white resize-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe this persona in detail..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="traits"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      Personality Traits
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            List personality traits separated by commas (e.g.,
                            friendly, patient, knowledgeable)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <input
                    type="text"
                    id="traits"
                    name="traits"
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., friendly, patient, knowledgeable"
                  />
                  <p className="text-xs text-gray-400">
                    Separate traits with commas
                  </p>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="image"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-pink-400" />
                      Persona Image
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Upload an image that represents this persona&apos;s
                            appearance or character
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Replace the old image upload/generation code with our new client component */}
                  <ImageUploader />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="tone"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                      Communication Tone
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Describe how this persona should communicate (e.g.,
                            formal, casual, enthusiastic)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <input
                    type="text"
                    id="tone"
                    name="tone"
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., formal, casual, enthusiastic"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="style"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      <Palette className="h-3.5 w-3.5 text-green-400" />
                      Writing Style
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Describe the writing style (e.g., concise, detailed,
                            storytelling)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <input
                    type="text"
                    id="style"
                    name="style"
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., concise, detailed, storytelling"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="expertise"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      <Brain className="h-3.5 w-3.5 text-yellow-400" />
                      Areas of Expertise
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            List areas of knowledge or expertise separated by
                            commas
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <input
                    type="text"
                    id="expertise"
                    name="expertise"
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., science, history, programming"
                  />
                  <p className="text-xs text-gray-400">
                    Separate areas with commas
                  </p>
                </div>

                <div className="pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="createChatbot" name="createChatbot" />
                    <Label
                      htmlFor="createChatbot"
                      className="text-sm text-gray-300"
                    >
                      Create a chatbot with this persona after saving
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Persona
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
