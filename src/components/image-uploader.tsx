"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";

export function ImageUploader() {
  const [activeTab, setActiveTab] = useState<"upload" | "generate">("upload");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePromptRef = useRef<HTMLInputElement>(null);
  const modelKeyRef = useRef<HTMLSelectElement>(null);
  const generatedImageUrlRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);

        // Clear the generated image URL when uploading a file
        if (generatedImageUrlRef.current) {
          generatedImageUrlRef.current.value = "";
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle image generation
  const handleGenerateImage = async () => {
    const prompt = imagePromptRef.current?.value;
    const modelKey = modelKeyRef.current?.value || "stability-sdxl";

    if (!prompt || prompt.trim() === "") {
      alert("Please enter a description for the image");
      return;
    }

    // Show generating indicator
    setIsGenerating(true);

    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelKey: modelKey,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();

      if (!data.images || data.images.length === 0) {
        throw new Error("No images were generated");
      }

      // Get the generated image URL
      const generatedImageUrl = data.images[0].url;

      // Update the preview
      setPreviewUrl(generatedImageUrl);

      // Store the URL in the hidden input
      if (generatedImageUrlRef.current) {
        generatedImageUrlRef.current.value = generatedImageUrl;
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs for Upload/Generate options */}
      <div className="flex border border-gray-700 rounded-lg overflow-hidden">
        <button
          type="button"
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeTab === "upload"
              ? "bg-gray-800 text-blue-400 border-b-2 border-blue-500"
              : "bg-gray-800/50 text-gray-400"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          Upload Image
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeTab === "generate"
              ? "bg-gray-800 text-blue-400 border-b-2 border-blue-500"
              : "bg-gray-800/50 text-gray-400"
          }`}
          onClick={() => setActiveTab("generate")}
        >
          Generate with AI
        </button>
      </div>

      {/* Upload Image Section */}
      {activeTab === "upload" && (
        <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors">
          <input
            type="file"
            id="image"
            name="image"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-8 w-8 text-gray-500" />
            <p className="text-sm text-gray-400">
              Drag and drop an image, or{" "}
              <span className="text-blue-400">browse</span>
            </p>
            <p className="text-xs text-gray-500">
              Recommended: Square image, 512x512px or larger
            </p>
          </div>
        </div>
      )}

      {/* Generate Image Section */}
      {activeTab === "generate" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="imagePrompt" className="text-sm text-gray-400">
              Image Description
            </Label>
            <input
              type="text"
              id="imagePrompt"
              name="imagePrompt"
              ref={imagePromptRef}
              className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the image you want to generate..."
            />
            <p className="text-xs text-gray-500">
              Be specific and descriptive for best results
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelKey" className="text-sm text-gray-400">
              AI Model
            </Label>
            <select
              id="modelKey"
              name="modelKey"
              ref={modelKeyRef}
              className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="stability-sdxl">Stable Diffusion XL</option>
              <option value="stability-sdxl-turbo">SDXL Turbo (Faster)</option>
              <option value="dalle3">DALL-E 3</option>
            </select>
          </div>

          <Button
            type="button"
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleGenerateImage}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Image"
            )}
          </Button>
        </div>
      )}

      {/* Image preview */}
      {previewUrl && (
        <div className="mt-2">
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-800 border border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <ImageIcon className="h-8 w-8" />
            </div>
            <img
              src={previewUrl}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Hidden input to store the generated image URL */}
      <input
        type="hidden"
        id="generatedImageUrl"
        name="generatedImageUrl"
        ref={generatedImageUrlRef}
      />
    </div>
  );
}
