import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { DatabaseService } from "@/services/database.service";

// Define message type for better type safety
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Use OpenRouter API instead of OpenAI
async function generateChatResponse(messages: Message[]) {
  try {
    console.log(
      "Generating chat response with messages:",
      JSON.stringify(messages.slice(0, 2))
    );

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "https://spicychat.ai",
          "X-Title": "SpicyChat AI", // Site title for rankings on openrouter.ai
        },
        body: JSON.stringify({
          model: "gryphe/mythomax-l2-13b:free",
          messages: messages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      return "I'm sorry, there was an error processing your request. Please try again later.";
    }

    const data = await response.json();
    console.log(
      "OpenRouter API response:",
      JSON.stringify(data).substring(0, 200) + "..."
    );

    return (
      data.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return "I'm sorry, there was an error processing your request. Please try again later.";
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Chat API route called");

    // Get the current user from Clerk
    const user = await currentUser();
    console.log("User authenticated:", user?.id);

    // If no user is authenticated, return unauthorized
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { chatbotId, message } = body;
    console.log("Request body:", {
      chatbotId,
      messagePreview: message?.substring(0, 50),
    });

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields: chatbotId and message" },
        { status: 400 }
      );
    }

    // Get the chatbot
    const chatbot = await DatabaseService.getChatbot(chatbotId);
    console.log("Chatbot found:", chatbot?.id);

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Get the persona
    const persona = await DatabaseService.getPersona(chatbot.personaId);
    console.log("Persona found:", persona?.id);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Format messages for API - just the current message without history
    const systemPrompt = `You are ${persona.name || "AI Assistant"}, ${
      persona.description || ""
    }. ${persona.instructions || ""}
Always stay in character and respond as ${
      persona.name || "AI Assistant"
    } would. Keep your responses concise and engaging.`;

    const formattedMessages: Message[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ];

    // Generate response with OpenRouter API
    console.log("Generating response...");
    const responseContent = await generateChatResponse(formattedMessages);
    console.log("Response generated, length:", responseContent.length);

    // Return the response without saving to database
    return NextResponse.json({
      success: true,
      message: {
        id: `msg_${Date.now()}`,
        content: responseContent,
        role: "assistant",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message", details: error.message },
      { status: 500 }
    );
  }
}
