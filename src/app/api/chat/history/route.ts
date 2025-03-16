import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { DatabaseService } from "@/services/database.service";

// GET endpoint to retrieve chat history
export async function GET(request: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();

    // If no user is authenticated, return unauthorized
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const chatbot = await DatabaseService.getChatbot(chatbotId);
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Get conversations for this user and chatbot
    const conversations = await DatabaseService.getUserChatbotConversations(
      user.id,
      chatbotId
    );

    // If no conversations exist, return empty array
    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ conversations: [], messages: [] });
    }

    // Sort conversations by createdAt (newest first)
    const sortedConversations = conversations.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Get messages for the most recent conversation
    const messages = await DatabaseService.getConversationMessages(
      sortedConversations[0].id
    );

    return NextResponse.json({
      conversations: sortedConversations,
      messages,
      conversationId: sortedConversations[0].id,
    });
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chat history" },
      { status: 500 }
    );
  }
}

// POST endpoint to save a new message
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
    const { conversationId, content, role } = body;

    if (!conversationId || !content || !role) {
      return NextResponse.json(
        { error: "Missing required fields: conversationId, content, and role" },
        { status: 400 }
      );
    }

    // Verify conversation exists and belongs to user
    const conversation = await DatabaseService.getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.userId !== user.id) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to add messages to this conversation",
        },
        { status: 403 }
      );
    }

    // Create new message
    const message = await DatabaseService.createMessage({
      conversationId,
      content,
      role,
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a conversation
export async function DELETE(request: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();

    // If no user is authenticated, return unauthorized
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get conversationId from URL params
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing required parameter: conversationId" },
        { status: 400 }
      );
    }

    // Verify conversation exists and belongs to user
    const conversation = await DatabaseService.getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.userId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this conversation" },
        { status: 403 }
      );
    }

    // Delete the conversation
    await DatabaseService.deleteConversation(conversationId);

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
