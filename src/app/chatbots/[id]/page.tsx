"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getChatbot } from "@/app/actions/chatbot";
import { DeleteChatbotButton } from "@/components/delete-chatbot-button";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Send, Settings, Wand, Sparkles, Compass, Zap } from "lucide-react";

// Define message type
type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

// Function to format timestamp
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Function to render message content with images
function renderMessageContent(content: string) {
  // Check if the content contains an image markdown
  const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);

  if (imageMatch && imageMatch[1]) {
    const imageUrl = imageMatch[1];
    return (
      <div>
        <div className="mb-2">{content.replace(imageMatch[0], "")}</div>
        <div className="relative aspect-square max-w-[300px] overflow-hidden rounded-lg shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Generated image"
            className="object-cover w-full h-full"
            onClick={() => window.open(imageUrl, "_blank")}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
    );
  }

  // Regular text message
  return <p className="whitespace-pre-wrap">{content}</p>;
}

export default function ChatbotPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.id as string;

  const [chatbot, setChatbot] = useState<any>(null);
  const [persona, setPersona] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedImageModel, setSelectedImageModel] =
    useState("stability-sdxl");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [chatHistoryId, setChatHistoryId] = useState<string | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imagePromptRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available models for the dropdown
  const modelOptions = [
    { label: "Stable Diffusion XL", value: "stability-sdxl" },
    { label: "SDXL Turbo (Faster)", value: "stability-sdxl-turbo" },
    { label: "Playground v2", value: "playground-v2" },
  ];

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(
        120,
        Math.max(40, textarea.scrollHeight)
      )}px`;
    }
  }, [inputValue]);

  // Fetch chatbot data and chat history on component mount
  useEffect(() => {
    async function loadChatbotAndHistory() {
      try {
        setLoading(true);

        // Fetch the current user
        const userResponse = await fetch("/api/user");
        let userData = null;
        if (userResponse.ok) {
          userData = await userResponse.json();
          setCurrentUser(userData.user);
        }

        // Fetch chatbot data
        const response = await fetch(`/api/chatbots/${chatId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load chatbot");
        }

        setChatbot(data.chatbot);
        setPersona(data.persona);

        // If user is authenticated, fetch chat history
        if (userData?.user?.id) {
          try {
            const historyResponse = await fetch(
              `/api/chat/history?chatbotId=${chatId}`
            );

            if (historyResponse.ok) {
              const historyData = await historyResponse.json();

              if (historyData.history && historyData.history.length > 0) {
                // Convert timestamps to numbers if they're strings
                const formattedHistory = historyData.history.map(
                  (msg: any) => ({
                    ...msg,
                    timestamp:
                      typeof msg.timestamp === "string"
                        ? new Date(msg.timestamp).getTime()
                        : msg.timestamp,
                  })
                );

                setMessages(formattedHistory);
                setChatHistoryId(historyData.chatId);
                console.log("Loaded chat history:", formattedHistory);
              } else {
                // Add initial greeting message if no history
                addInitialGreeting(data.chatbot, data.persona);
              }
            } else {
              // Add initial greeting message if failed to fetch history
              addInitialGreeting(data.chatbot, data.persona);
            }
          } catch (historyError) {
            console.error("Error loading chat history:", historyError);
            // Add initial greeting message if error
            addInitialGreeting(data.chatbot, data.persona);
          }
        } else {
          // Add initial greeting message if user not authenticated
          addInitialGreeting(data.chatbot, data.persona);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
        console.error("Error loading chatbot:", err);
      } finally {
        setLoading(false);
      }
    }

    if (chatId) {
      loadChatbotAndHistory();
    }
  }, [chatId]);

  // Function to add initial greeting
  function addInitialGreeting(chatbot: any, persona: any) {
    if (chatbot && persona) {
      const expertise = persona.expertise?.join(", ") || "various topics";
      const traits = persona.traits?.join(", ") || "helpful";

      let greeting = `Hi! I'm ${chatbot.name}. `;

      if (persona.description) {
        greeting += `${persona.description}. `;
      }

      greeting += `I'm here to chat about ${expertise}. `;

      if (traits) {
        greeting += `I'm ${traits}. `;
      }

      greeting += `How can I help you today?`;

      setMessages([
        {
          role: "assistant",
          content: greeting,
          timestamp: Date.now(),
        },
      ]);
    }
  }

  // Save chat history when messages change
  useEffect(() => {
    async function saveChatHistory() {
      // Only save if user is authenticated and we have messages
      if (currentUser?.id && messages.length > 0 && chatbot) {
        try {
          // Convert timestamps from numbers to ISO strings before saving
          const messagesWithStringTimestamps = messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp).toISOString(),
          }));

          const response = await fetch("/api/chat/history", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatbotId: chatId,
              messages: messagesWithStringTimestamps,
              chatId: chatHistoryId,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.chatId && !chatHistoryId) {
              setChatHistoryId(data.chatId);
            }
          }
        } catch (error) {
          console.error("Error saving chat history:", error);
        }
      }
    }

    // Don't save on initial load
    if (!loading && messages.length > 0) {
      saveChatHistory();
    }
  }, [messages, currentUser, chatId, chatHistoryId, chatbot, loading]);

  useEffect(() => {
    // Adjust viewport height for mobile browsers
    function setVh() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }

    setVh();
    window.addEventListener("resize", setVh);

    return () => {
      window.removeEventListener("resize", setVh);
    };
  }, []);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component loads
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!inputValue.trim() || isSending) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      // Send only the current message without history
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbotId: chatId,
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message.content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Scroll to bottom after receiving response
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble responding right now. Please try again later. Error: " +
            (err.message || "Unknown error"),
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
      // Ensure we scroll to bottom after setting sending to false
      setTimeout(scrollToBottom, 100);
    }
  }

  async function handleGenerateImage() {
    if (!imagePromptRef.current?.value.trim() || isGeneratingImage) return;

    const imagePrompt = imagePromptRef.current.value.trim();
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);

    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          modelKey: selectedImageModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Image generation error:", errorData);
        toast.error(errorData.error || "Failed to generate image");
        return;
      }

      const data = await response.json();

      if (!data.images || data.images.length === 0) {
        toast.error("No images were generated");
        return;
      }

      // Use the first image
      setGeneratedImageUrl(data.images[0].url);

      // Add the image to the chat
      if (data.images[0].url) {
        const imageMessage = `I've generated this image based on your prompt: "${imagePrompt}"\n\n![Generated Image](${data.images[0].url})`;

        // Add as assistant message
        const assistantMessage: Message = {
          role: "assistant",
          content: imageMessage,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Clear the image prompt
        if (imagePromptRef.current) {
          imagePromptRef.current.value = "";
        }

        // Hide the image generator
        setShowImageGenerator(false);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    // Send message on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  }

  // Generate suggestion topics based on persona
  const getSuggestionTopics = () => {
    if (!persona) return [];

    const topics = [
      {
        icon: <Sparkles className="h-5 w-5" />,
        title: `${chatbot?.name}'s Expertise`,
        subtitle: "Learn more about me",
      },
      {
        icon: <Compass className="h-5 w-5" />,
        title: "Popular Topics",
        subtitle: "Trending conversations",
      },
      {
        icon: <Zap className="h-5 w-5" />,
        title: `About ${persona?.name || "My Persona"}`,
        subtitle: "My personality & traits",
      },
    ];

    return topics;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-red-400">
            Error Loading Chatbot
          </h2>
          <p className="mb-4">{error}</p>
          <Button
            onClick={() => router.push("/chatbots")}
            variant="outline"
            className="cursor-pointer"
          >
            Go Back to Chatbots
          </Button>
        </div>
      </div>
    );
  }

  if (!chatbot || !persona) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-yellow-400">
            Chatbot Not Found
          </h2>
          <p className="mb-4">
            Sorry, we couldn't find the chatbot you're looking for.
          </p>
          <Button
            onClick={() => router.push("/chatbots")}
            variant="outline"
            className="cursor-pointer"
          >
            Go Back to Chatbots
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            {chatbot?.imageUrl ? (
              <Image
                src={chatbot.imageUrl}
                alt={chatbot.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-xs font-bold">
                {chatbot?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="font-semibold text-sm">{chatbot?.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => setShowImageGenerator(!showImageGenerator)}
          >
            <Wand className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/chatbots/${params.id}/settings`)}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main content area - Scrollable */}
      <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
        {/* Image Generator - Conditionally shown */}
        {showImageGenerator && (
          <div className="p-2 bg-gray-900/30 border-b border-gray-800 mx-auto max-w-3xl">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium">Image Generator</div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedImageModel}
                  onChange={(e) => setSelectedImageModel(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs"
                >
                  {modelOptions.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <Input
                  ref={imagePromptRef}
                  placeholder="Describe the image..."
                  className="flex-1 bg-gray-800 border-gray-700 text-xs h-8"
                />
                <Button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="bg-blue-600 hover:bg-blue-700 h-8 text-xs px-3"
                >
                  {isGeneratingImage ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Message - Centered when no messages */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center px-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center mb-4">
              {chatbot?.imageUrl ? (
                <Image
                  src={chatbot.imageUrl}
                  alt={chatbot.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl font-bold">
                  {chatbot?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-2 max-w-md">
              <h1 className="text-xl font-bold">Hi, I'm {chatbot?.name}</h1>
              <h2 className="text-lg">Can I help you with anything?</h2>
              <p className="text-gray-400 text-sm">
                Ready to assist you with anything you need, from answering
                questions to providing recommendations. Let's get started!
              </p>
            </div>

            {/* Suggestion Cards - In a row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-6 w-full max-w-2xl">
              {getSuggestionTopics().map((topic, index) => (
                <Card
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-colors p-2 cursor-pointer"
                  onClick={() => {
                    setInputValue(`Tell me about ${topic.title}`);
                    inputRef.current?.focus();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-700 rounded-full p-1.5">
                      {topic.icon}
                    </div>
                    <div>
                      <div className="font-medium text-xs">{topic.title}</div>
                      <div className="text-xs text-gray-400">
                        {topic.subtitle}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages - With proper spacing */}
        {messages.length > 0 && (
          <div className="pb-20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`px-4 py-4 ${
                  message.role === "assistant" ? "bg-gray-900/30" : ""
                }`}
              >
                <div className="max-w-3xl mx-auto">
                  <div
                    className={`${
                      message.role === "user" ? "text-white" : "text-white"
                    }`}
                  >
                    {renderMessageContent(message.content)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-20" />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom, always visible */}
      <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 bg-black border-t border-gray-800 z-10">
        <div className="max-w-[650px] w-full mx-auto relative">
          <div className="relative rounded-xl border border-gray-700 bg-[#0b0d0e] overflow-hidden">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${chatbot?.name} anything...`}
              className="bg-transparent border-0 focus:ring-0 focus:border-0 text-white py-3 px-4 pr-12 text-sm min-h-[50px] shadow-none w-full"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white hover:bg-transparent h-8 w-8"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSending}
            >
              <Send className={`h-4 w-4 ${isSending ? "animate-pulse" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
