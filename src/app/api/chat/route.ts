import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { DatabaseService } from "@/services/database.service";

// Use OpenRouter API instead of OpenAI
async function generateChatResponse(messages: any[]) {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "https://spicychat.ai",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "anthropic/claude-3-opus:beta",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    const data = await response.json();
    return (
      data.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return "I'm sorry, there was an error processing your request.";
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();

    // If no user is authenticated, return unauthorized
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { chatbotId, message, messageId, conversationId } = body;

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields: chatbotId and message" },
        { status: 400 }
      );
    }

    // Get the chatbot
    const chatbot = await DatabaseService.getChatbot(chatbotId);

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Get the persona
    const persona = await DatabaseService.getPersona(chatbot.personaId);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Create or get conversation
    let conversation;
    if (conversationId) {
      conversation = await DatabaseService.getConversation(conversationId);
      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      conversation = await DatabaseService.createConversation({
        userId: user.id,
        chatbotId,
      });
    }

    // Save user message
    const userMessage = await DatabaseService.createMessage({
      conversationId: conversation.id,
      content: message,
      role: "user",
      messageId,
    });

    // Prepare conversation history
    const messages = await DatabaseService.getConversationMessages(
      conversation.id
    );

    // Format messages for API
    const formattedMessages = [
      {
        role: "system",
        content: `You are ${persona.name}, ${persona.description}. ${persona.instructions}`,
      },
      ...messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    // Generate response with OpenRouter API
    const responseContent = await generateChatResponse(formattedMessages);

    // Save assistant message
    const assistantMessage = await DatabaseService.createMessage({
      conversationId: conversation.id,
      content: responseContent,
      role: "assistant",
    });

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
