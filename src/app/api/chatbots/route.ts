import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { DatabaseService } from "@/services/database.service";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();

    // If no user is authenticated, return unauthorized
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's chatbots
    const chatbots = await DatabaseService.getUserChatbots(user.id);

    return NextResponse.json({
      success: true,
      chatbots,
    });
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    return NextResponse.json(
      { error: "Failed to fetch chatbots" },
      { status: 500 }
    );
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
    const { name, description, personaId, visibility = "private" } = body;

    if (!name || !personaId) {
      return NextResponse.json(
        { error: "Missing required fields: name and personaId" },
        { status: 400 }
      );
    }

    // Create the chatbot
    const chatbot = await DatabaseService.createChatbot({
      name,
      description,
      personaId,
      visibility,
      userId: user.id,
      username:
        user.username ||
        `${user.firstName} ${user.lastName}`.trim() ||
        "Anonymous",
    });

    // Revalidate paths
    revalidatePath("/chatbots");
    revalidatePath(`/chatbots/${chatbot.id}`);

    return NextResponse.json({
      success: true,
      chatbot,
    });
  } catch (error) {
    console.error("Error creating chatbot:", error);
    return NextResponse.json(
      { error: "Failed to create chatbot" },
      { status: 500 }
    );
  }
}
