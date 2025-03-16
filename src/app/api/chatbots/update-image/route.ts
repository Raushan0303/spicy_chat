import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { DatabaseService } from "@/services/database.service";

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
    const { chatbotId, imageUrl } = body;

    if (!chatbotId || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields: chatbotId and imageUrl" },
        { status: 400 }
      );
    }

    // Get the chatbot
    const chatbot = await DatabaseService.getChatbot(chatbotId);

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Check if the user owns the chatbot
    if (chatbot.userId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this chatbot" },
        { status: 403 }
      );
    }

    // Update the chatbot image
    const updatedChatbot = await DatabaseService.updateChatbot(chatbotId, {
      imageUrl,
    });

    return NextResponse.json({
      success: true,
      chatbot: updatedChatbot,
    });
  } catch (error) {
    console.error("Error updating chatbot image:", error);
    return NextResponse.json(
      { error: "Failed to update chatbot image" },
      { status: 500 }
    );
  }
}
