import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Chat } from "@/models/Chat";
import { Chatbot } from "@/models/Chatbot";

// GET endpoint to retrieve chat history
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();
    const user = authenticated ? await getUser() : null;

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get chatbotId from URL params
    const { searchParams } = new URL(request.url);
    const chatbotId = searchParams.get("chatbotId");

    if (!chatbotId) {
      return NextResponse.json(
        { error: "Missing required parameter: chatbotId" },
        { status: 400 }
      );
    }

    // Verify chatbot exists
    const chatbot = await Chatbot.get(chatbotId);
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Get chat history for this user and chatbot
    const chats = await Chat.query("chatbotId")
      .eq(chatbotId)
      .where("userId")
      .eq(user.id)
      .exec();

    // If no chat history exists, return empty array
    if (!chats || chats.length === 0) {
      return NextResponse.json({ history: [] });
    }

    // Sort chats by createdAt (newest first)
    const sortedChats = chats.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Return the most recent chat
    return NextResponse.json({
      history: sortedChats[0].messages || [],
      chatId: sortedChats[0].id,
    });
  } catch (error: any) {
    console.error("Error retrieving chat history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve chat history" },
      { status: 500 }
    );
  }
}

// POST endpoint to save chat history
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();
    const user = authenticated ? await getUser() : null;

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { chatbotId, messages, chatId } = body;

    if (!chatbotId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing required fields: chatbotId and messages array" },
        { status: 400 }
      );
    }

    // Verify chatbot exists
    const chatbot = await Chatbot.get(chatbotId);
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    let chat;

    // If chatId is provided, update existing chat
    if (chatId) {
      chat = await Chat.get(chatId);

      // Verify the chat belongs to this user
      if (chat && chat.userId === user.id) {
        chat.messages = messages;
        chat.updatedAt = new Date().toISOString();
        await chat.save();
      } else {
        // If chat doesn't exist or doesn't belong to user, create new
        chat = await Chat.create({
          chatbotId,
          userId: user.id,
          messages,
        });
      }
    } else {
      // Create new chat
      chat = await Chat.create({
        chatbotId,
        userId: user.id,
        messages,
      });
    }

    return NextResponse.json({
      success: true,
      chatId: chat.id,
    });
  } catch (error: any) {
    console.error("Error saving chat history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save chat history" },
      { status: 500 }
    );
  }
}
