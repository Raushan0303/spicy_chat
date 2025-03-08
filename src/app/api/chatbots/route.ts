import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database.service";
import { requireAuth } from "@/utils/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) return;

    const data = await req.json();
    // Ensure the chatbot is associated with the authenticated user
    data.userId = user.id;

    const chatbot = await DatabaseService.createChatbot(data);
    return NextResponse.json(chatbot);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create chatbot" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) return;

    // Get chatbots for the authenticated user
    const chatbots = await DatabaseService.getChatbotsByUserId(user.id);
    return NextResponse.json(chatbots);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chatbots" },
      { status: 500 }
    );
  }
}
