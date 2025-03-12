"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import toast from "react-hot-toast";
import { createChatbot } from "@/app/actions/chatbot";
import {
  MessageSquareText,
  User,
  Globe,
  Lock,
  Image as ImageIcon,
  Save,
  HelpCircle,
  Plus,
  Wand2,
  X,
  Download,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateChatbotFormProps {
  personas: any[];
}

export function CreateChatbotForm({ personas }: CreateChatbotFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasPersonas = personas.length > 0;
  const [imageUrl, setImageUrl] = useState("");
  const imageUrlInputRef = useRef<HTMLInputElement>(null);

  // Image generation states
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState("stability-sdxl");

  // Function to generate image
  async function generateImage() {
    if (!imagePrompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }

    setIsGeneratingImage(true);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          modelKey: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();

      if (!data.images || data.images.length === 0) {
        throw new Error("No images were generated");
      }

      setGeneratedImage(data.images[0].url);
      toast.success("Image generated successfully!");
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  // Function to use the generated image
  function useGeneratedImage() {
    if (generatedImage) {
      setImageUrl(generatedImage);
      if (imageUrlInputRef.current) {
        imageUrlInputRef.current.value = generatedImage;
      }
      setShowImageDialog(false);
      toast.success("Image added to your chatbot!");
    }
  }

  // Function to prepare image prompt based on chatbot details
  function prepareImagePrompt() {
    const nameInput = document.getElementById("name") as HTMLInputElement;
    const descriptionInput = document.getElementById(
      "description"
    ) as HTMLTextAreaElement;

    let prompt = "A professional avatar for an AI chatbot";

    if (nameInput && nameInput.value) {
      prompt += ` named "${nameInput.value}"`;
    }

    if (descriptionInput && descriptionInput.value) {
      const shortDesc = descriptionInput.value.split(".")[0]; // Just take the first sentence
      prompt += ` that ${shortDesc}`;
    }

    setImagePrompt(prompt);
    setShowImageDialog(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Use the state value for imageUrl if it exists
    const finalImageUrl = imageUrl || (formData.get("imageUrl") as string);

    try {
      const result = await createChatbot({
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || "",
        visibility:
          formData.get("visibility") === "public" ? "public" : "private",
        personaId: formData.get("personaId") as string,
        imageUrl: finalImageUrl,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to create chatbot");
      }

      toast.success("Chatbot created successfully!");

      if (result.chatbot && result.chatbot.id) {
        router.push(`/chatbots/${result.chatbot.id}`);
      } else {
        router.push("/chatbots");
      }
    } catch (error: any) {
      console.error("Error creating chatbot:", error);
      toast.error(error.message || "Failed to create chatbot");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hasPersonas) {
    return (
      <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-blue-400" />
            Create a Persona First
          </CardTitle>
          <CardDescription>
            You need to create a persona before you can build a chatbot
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <p className="mb-6 text-gray-300">
            Personas define the personality, tone, and expertise of your
            chatbots. Create your first persona to get started with building
            your AI assistant.
          </p>
          <Link href="/personas/create">
            <Button className="bg-blue-600 hover:bg-blue-700 transition-all py-6 px-8 text-base font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Your First Persona
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MessageSquareText className="h-6 w-6 text-blue-400" />
              Chatbot Configuration
            </CardTitle>
            <CardDescription>
              Configure your chatbot's details and personality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Chatbot Name <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Give your chatbot a descriptive name that reflects
                              its purpose or personality
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="e.g., Sci-Fi Expert, History Teacher"
                      className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              Describe what this chatbot does or knows about
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
                      placeholder="Describe what this chatbot does or knows about..."
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="imageUrl"
                        className="text-sm font-medium flex items-center gap-1.5"
                      >
                        <ImageIcon className="h-3.5 w-3.5 text-green-400" />
                        Chatbot Image
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Add an image URL or generate an image for your
                              chatbot
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        ref={imageUrlInputRef}
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-700 bg-gray-800/60 hover:bg-gray-800 transition-all flex items-center gap-2 whitespace-nowrap"
                        onClick={prepareImagePrompt}
                      >
                        <Wand2 className="h-4 w-4 text-purple-400" />
                        Generate
                      </Button>
                    </div>
                    {imageUrl && (
                      <div className="mt-2 relative aspect-square w-24 h-24 overflow-hidden rounded-md border border-gray-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt="Chatbot avatar preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Enter an image URL or generate a custom avatar for your
                      chatbot
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="personaId"
                          className="text-sm font-medium flex items-center gap-1.5"
                        >
                          <User className="h-3.5 w-3.5 text-purple-400" />
                          Persona <span className="text-red-500">*</span>
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                Select a persona that defines your chatbot's
                                personality, tone, and expertise
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Link
                        href="/personas/create"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Create new
                      </Link>
                    </div>
                    <select
                      id="personaId"
                      name="personaId"
                      required
                      className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" disabled selected>
                        Select a persona
                      </option>
                      {personas.map((persona: any) => (
                        <option key={persona.id} value={persona.id}>
                          {persona.name}{" "}
                          {persona.tone ? `(${persona.tone})` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400">
                      The persona defines the chatbot's personality, tone, and
                      expertise
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-blue-400" />
                        Visibility
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Choose who can see and interact with your chatbot
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <RadioGroup
                      defaultValue="private"
                      name="visibility"
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2 bg-gray-800/40 p-3 rounded-md border border-gray-700 hover:bg-gray-800/60 transition-colors">
                        <RadioGroupItem
                          value="private"
                          id="private"
                          className="text-blue-400"
                        />
                        <Label
                          htmlFor="private"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Lock className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="font-medium">Private</p>
                            <p className="text-xs text-gray-400">
                              Only you can see and interact with this chatbot
                            </p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 bg-gray-800/40 p-3 rounded-md border border-gray-700 hover:bg-gray-800/60 transition-colors">
                        <RadioGroupItem
                          value="public"
                          id="public"
                          className="text-blue-400"
                        />
                        <Label
                          htmlFor="public"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Globe className="h-4 w-4 text-green-400" />
                          <div>
                            <p className="font-medium">Public</p>
                            <p className="text-xs text-gray-400">
                              Anyone can see and interact with this chatbot
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 transition-all py-6 text-base font-medium flex-1"
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Chatbot"}
                </Button>

                <Link href="/chatbots" className="flex-1 sm:flex-initial">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 transition-all w-full"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Image Generation Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-400" />
              Generate Chatbot Image
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a custom image for your chatbot using AI
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imagePrompt" className="text-sm font-medium">
                  Image Prompt
                </Label>
                <Textarea
                  id="imagePrompt"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white resize-none min-h-[120px]"
                />
                <p className="text-xs text-gray-400">
                  Be specific and descriptive for better results
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageModel" className="text-sm font-medium">
                  Image Model
                </Label>
                <select
                  id="imageModel"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white"
                >
                  <option value="stability-sdxl">Stable Diffusion XL</option>
                  <option value="stability-sdxl-turbo">
                    SDXL Turbo (Faster)
                  </option>
                  <option value="dalle3">DALL-E 3</option>
                </select>
              </div>

              <Button
                type="button"
                onClick={generateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 transition-all py-5"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center border border-gray-800 rounded-md bg-gray-800/30 p-4">
              {isGeneratingImage ? (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-4" />
                  <p className="text-gray-300">Creating your image...</p>
                  <Skeleton className="h-40 w-full mt-4 bg-gray-800" />
                </div>
              ) : generatedImage ? (
                <div className="flex flex-col items-center w-full">
                  <div className="relative aspect-square w-full max-h-[300px] overflow-hidden rounded-md mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImage}
                      alt="Generated chatbot avatar"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      type="button"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={useGeneratedImage}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Use This Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={() => setGeneratedImage(null)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Discard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <ImageIcon className="h-16 w-16 text-gray-700 mb-4" />
                  <p className="text-gray-400 mb-2">No image generated yet</p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Enter a prompt and click "Generate Image" to create a custom
                    avatar for your chatbot
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
              onClick={() => setShowImageDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
