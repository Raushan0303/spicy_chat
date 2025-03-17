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
import {
  Send,
  Settings,
  Wand,
  Sparkles,
  Compass,
  Zap,
  Home,
} from "lucide-react";

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

  // Add this effect to handle mobile viewport issues
  useEffect(() => {
    // Fix for mobile viewport height issues
    const fixMobileViewportHeight = () => {
      // First we get the viewport height and multiply it by 1% to get a value for a vh unit
      const vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty("--vh", `${vh}px`);

      // Force redraw for iOS
      document.body.style.display = "none";
      document.body.offsetHeight; // Trigger a reflow
      document.body.style.display = "";
    };

    // Run the function initially
    fixMobileViewportHeight();

    // Add event listener to update on resize and orientation change
    window.addEventListener("resize", fixMobileViewportHeight);
    window.addEventListener("orientationchange", fixMobileViewportHeight);

    return () => {
      window.removeEventListener("resize", fixMobileViewportHeight);
      window.removeEventListener("orientationchange", fixMobileViewportHeight);
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
    <div className="flex flex-col h-[100vh] h-[calc(var(--vh,1vh)*100)] bg-black text-white overflow-hidden relative">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
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
      <div
        className="flex-1 overflow-y-auto pb-[140px] md:pb-[80px] overscroll-contain"
        ref={chatContainerRef}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
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
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] text-center px-4">
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
          <div>
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
            <div ref={messagesEndRef} className="h-[140px] md:h-[80px]" />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom, always visible */}
      <div
        className="fixed bottom-[60px] md:bottom-0 left-0 right-0 p-2 sm:p-4 bg-black border-t border-gray-800 z-50"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="max-w-[650px] w-full mx-auto relative">
          <div className="relative rounded-xl border border-gray-700 bg-[#0b0d0e] overflow-hidden">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${chatbot?.name} anything...`}
              className="bg-transparent border-0 focus:ring-0 focus:border-0 text-white py-3 px-4 pr-12 text-sm min-h-[50px] shadow-none w-full"
              style={{
                WebkitAppearance: "none",
                WebkitBorderRadius: "0",
                appearance: "none",
              }}
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

      {/* Mobile navigation tabs - visible only on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-t border-gray-800 z-50">
        <div className="flex justify-around items-center h-[60px]">
          <Link
            href="/"
            className="flex flex-col items-center justify-center w-full py-2 hover:bg-gray-900/50"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            href="/chatbots"
            className="flex flex-col items-center justify-center w-full py-2 hover:bg-gray-900/50"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 16.5C13.7614 16.5 16 14.2614 16 11.5C16 8.73858 13.7614 6.5 11 6.5C8.23858 6.5 6 8.73858 6 11.5C6 14.2614 8.23858 16.5 11 16.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs mt-1">Chatbots</span>
          </Link>

          <Link
            href="/images"
            className="flex flex-col items-center justify-center w-full py-2 hover:bg-gray-900/50"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 15L16 10L5 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs mt-1">Images</span>
          </Link>

          <Link
            href="/personas"
            className="flex flex-col items-center justify-center w-full py-2 hover:bg-gray-900/50"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs mt-1">Personas</span>
          </Link>

          <Link
            href="/settings"
            className="flex flex-col items-center justify-center w-full py-2 hover:bg-gray-900/50"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
