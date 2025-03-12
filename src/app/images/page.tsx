"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Download, Copy, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [selectedModel, setSelectedModel] = useState("stability-sdxl");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<
    { url: string; prompt: string; model: string }[]
  >([]);
  const [copied, setCopied] = useState(false);

  const downloadRef = useRef<HTMLAnchorElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 80), 200);
      textarea.style.height = `${newHeight}px`;
    };

    textarea.addEventListener("input", adjustHeight);
    adjustHeight();

    return () => {
      textarea.removeEventListener("input", adjustHeight);
    };
  }, []);

  // Available models for the dropdown
  const modelOptions = [
    { label: "Stable Diffusion XL", value: "stability-sdxl" },
    { label: "SDXL Turbo (Faster)", value: "stability-sdxl-turbo" },
    { label: "DALL-E 3", value: "dalle3" },
  ];

  async function handleGenerateImage(e: React.FormEvent) {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setGenerating(true);
    setGeneratedImages([]);
    setError(null);

    try {
      console.log(`Generating image with model: ${selectedModel}`);
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelKey: selectedModel,
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

      setGeneratedImages(data.images);
      toast.success("Image generated successfully!");
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "An error occurred");
      toast.error(error.message || "Failed to generate image");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownloadImage(imageUrl: string) {
    window.open(imageUrl, "_blank");
  }

  function handleCopyPrompt(promptText: string) {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          AI Image Studio
        </h1>
        <p className="text-gray-400 text-center max-w-2xl">
          Create stunning AI-generated images with detailed prompts. Choose from
          multiple models to match your creative vision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="bg-gray-900/60 border border-gray-800 shadow-xl lg:col-span-5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12.5v-9A1.5 1.5 0 0 1 3.5 2h17A1.5 1.5 0 0 1 22 3.5v17a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 20.5v-2"></path>
                  <path d="M8 2v20"></path>
                  <path d="M16 2v20"></path>
                  <path d="M2 9h20"></path>
                  <path d="M2 15h20"></path>
                </svg>
              </span>
              Create an Image
            </CardTitle>
            <CardDescription>
              Describe your vision in detail for the best results
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleGenerateImage} className="space-y-5">
              <div>
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium mb-2 text-gray-300"
                >
                  Image Description
                </label>
                <Textarea
                  id="prompt"
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A stunning digital artwork of a futuristic city with flying cars and neon lights..."
                  className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-white resize-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={generating}
                  style={{ minHeight: "80px", maxHeight: "200px" }}
                />
                <p className="text-xs text-gray-400 mt-1 flex justify-between">
                  <span>Be specific and descriptive for better results</span>
                  <span>{prompt.length} characters</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="size"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Image Size
                  </label>
                  <select
                    id="size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full p-2.5 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={generating}
                  >
                    <option value="256x256">Small (256x256)</option>
                    <option value="512x512">Medium (512x512)</option>
                    <option value="1024x1024">Large (1024x1024)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="model"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Image Model
                  </label>
                  <select
                    id="model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2.5 bg-gray-800/80 border border-gray-700 rounded-md text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={generating}
                  >
                    {modelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all py-6 text-lg font-medium"
                disabled={generating || !prompt.trim()}
              >
                {generating ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Creating Your Masterpiece...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v8"></path>
                      <path d="m4.93 10.93 1.41 1.41"></path>
                      <path d="M2 18h2"></path>
                      <path d="M20 18h2"></path>
                      <path d="m19.07 10.93-1.41 1.41"></path>
                      <path d="M22 22H2"></path>
                      <path d="m16 6-4 4-4-4"></path>
                      <path d="M16 18a4 4 0 0 0-8 0"></path>
                    </svg>
                    <span>Generate Image</span>
                  </div>
                )}
              </Button>

              {error && (
                <div className="bg-red-900/30 border border-red-800 rounded-md p-3 text-red-300 text-sm mt-2 flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <span className="bg-purple-600 w-7 h-7 rounded-full flex items-center justify-center">
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
                >
                  <path d="M5 3a2 2 0 0 0-2 2"></path>
                  <path d="M19 3a2 2 0 0 1 2 2"></path>
                  <path d="M21 19a2 2 0 0 1-2 2"></path>
                  <path d="M5 21a2 2 0 0 1-2-2"></path>
                  <path d="M9 3h1"></path>
                  <path d="M9 21h1"></path>
                  <path d="M14 3h1"></path>
                  <path d="M14 21h1"></path>
                  <path d="M3 9v1"></path>
                  <path d="M21 9v1"></path>
                  <path d="M3 14v1"></path>
                  <path d="M21 14v1"></path>
                </svg>
              </span>
              Gallery
            </h2>
            {generatedImages.length > 0 && (
              <Button
                variant="outline"
                className="text-sm border-gray-700 hover:bg-gray-800"
                onClick={() => setGeneratedImages([])}
              >
                Clear All
              </Button>
            )}
          </div>

          <AnimatePresence>
            {generating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-900/60 border border-gray-800 rounded-lg p-6 mb-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="text-lg font-medium">Creating your image...</p>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-64 w-full rounded-md bg-gray-800/80" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-3/4 rounded bg-gray-800/80" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-1/2 rounded bg-gray-800/80" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {generatedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6"
              >
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.1 },
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden shadow-xl backdrop-blur-sm"
                  >
                    <div className="relative group">
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={`Generated image: ${image.prompt}`}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4 w-full">
                          <div className="flex justify-between items-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white/10 backdrop-blur-md hover:bg-white/20"
                                    onClick={() =>
                                      handleCopyPrompt(image.prompt)
                                    }
                                  >
                                    <Copy size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy prompt</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="bg-white/10 backdrop-blur-md hover:bg-white/20"
                                      onClick={() =>
                                        handleDownloadImage(image.url)
                                      }
                                    >
                                      <Download size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Download image</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="bg-white/10 backdrop-blur-md hover:bg-white/20"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          image.url
                                        );
                                        toast.success("Image URL copied!");
                                      }}
                                    >
                                      <Share2 size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Share image URL</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                        {image.prompt}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">
                          Generated with:{" "}
                          <span className="text-blue-400">
                            {modelOptions.find((m) => m.value === image.model)
                              ?.label || image.model}
                          </span>
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-gray-700 hover:bg-gray-800"
                          onClick={() => handleDownloadImage(image.url)}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!generating && generatedImages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 border border-gray-800 rounded-lg p-8 text-center backdrop-blur-sm"
            >
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <div className="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500"
                  >
                    <rect
                      width="18"
                      height="18"
                      x="3"
                      y="3"
                      rx="2"
                      ry="2"
                    ></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </div>
                <p className="text-gray-300 text-lg font-medium mb-1">
                  No images generated yet
                </p>
                <p className="text-sm text-gray-500 max-w-md">
                  Enter a detailed prompt on the left and click "Generate Image"
                  to create your first AI masterpiece
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hidden download link */}
      <a ref={downloadRef} className="hidden"></a>
    </div>
  );
}
