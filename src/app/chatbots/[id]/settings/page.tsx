"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getChatbot,
  updateChatbot,
  generateChatbotImage,
  updateChatbotImage,
} from "@/app/actions/chatbot";
import toast from "react-hot-toast";
import Image from "next/image";
import { ArrowLeft, Save, Wand } from "lucide-react";

export default function ChatbotSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const [chatbot, setChatbot] = useState<any>(null);
  const [persona, setPersona] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [selectedImageModel, setSelectedImageModel] =
    useState("stability-sdxl");

  // Available models for the dropdown
  const modelOptions = [
    { label: "Stable Diffusion XL", value: "stability-sdxl" },
    { label: "SDXL Turbo (Faster)", value: "stability-sdxl-turbo" },
    { label: "DALL-E 3", value: "dalle3" },
  ];

  // Fetch chatbot data
  useEffect(() => {
    async function loadChatbot() {
      try {
        setLoading(true);
        const result = await getChatbot(params.id as string);

        if (result.success && result.chatbot) {
          setChatbot(result.chatbot);
          setPersona(result.persona);
          setName(result.chatbot.name || "");
          setDescription(result.chatbot.description || "");
          setImageUrl(result.chatbot.imageUrl || "");

          // Generate a default image prompt based on the persona
          if (result.persona) {
            const defaultPrompt = `Portrait of ${result.persona.name}, ${result.persona.description}`;
            setImagePrompt(defaultPrompt);
          }
        } else {
          toast.error(result.message || "Failed to load chatbot");
          router.push("/chatbots");
        }
      } catch (error) {
        console.error("Error loading chatbot:", error);
        toast.error("An error occurred while loading the chatbot");
        router.push("/chatbots");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadChatbot();
    }
  }, [params.id, router]);

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);

      const result = await updateChatbot({
        id: params.id as string,
        name,
        description,
        imageUrl,
      });

      if (result.success) {
        toast.success("Chatbot updated successfully");
        setChatbot({
          ...chatbot,
          name,
          description,
          imageUrl,
        });
      } else {
        toast.error(result.message || "Failed to update chatbot");
      }
    } catch (error) {
      console.error("Error updating chatbot:", error);
      toast.error("An error occurred while updating the chatbot");
    } finally {
      setSaving(false);
    }
  };

  // Handle generate image
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    toast.loading("Generating image...", { id: "generate-image" });

    try {
      console.log("Generating image for chatbot:", params.id);
      console.log("Using model:", selectedImageModel);

      // Directly call the API endpoint instead of using the server action
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          modelKey: selectedImageModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Image generation error:", errorData);
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();

      if (!data.images || data.images.length === 0) {
        throw new Error("No images were generated");
      }

      // Use the first image URL
      const generatedImageUrl = data.images[0].url;

      // Update the chatbot with the new image URL
      await updateChatbotImage(params.id as string, generatedImageUrl);

      setImageUrl(generatedImageUrl);
      toast.success("Image generated successfully!", { id: "generate-image" });

      // Force a refresh to show the new image
      router.refresh();
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image",
        { id: "generate-image" }
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/chatbots/${params.id}`)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Chat
          </Button>
          <h1 className="text-2xl font-bold">Chatbot Settings</h1>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-900 border-gray-700 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-gray-900 border-gray-700 mt-1 min-h-[100px]"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Current Image</Label>
                  <div className="relative w-full aspect-square max-w-[300px] rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={name || "Chatbot"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="imagePrompt">Image Prompt</Label>
                    <Textarea
                      id="imagePrompt"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="bg-gray-900 border-gray-700 mt-1 min-h-[100px]"
                      placeholder="Describe how you want your chatbot to look..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageModel">Image Model</Label>
                    <select
                      id="imageModel"
                      value={selectedImageModel}
                      onChange={(e) => setSelectedImageModel(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 mt-1"
                    >
                      {modelOptions.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="bg-blue-600 hover:bg-blue-700 mt-2"
                  >
                    {isGeneratingImage ? "Generating..." : "Generate Image"}
                    <Wand className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="text-sm text-gray-400 mt-2">
                    Generate a new image for your chatbot using AI. The image
                    will be automatically saved.
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
