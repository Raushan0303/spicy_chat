import { NextRequest, NextResponse } from "next/server";
import { getChatbot } from "@/app/actions/chatbot";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbotId = await params.id;

    if (!chatbotId) {
      return NextResponse.json(
        { error: "Chatbot ID is required" },
        { status: 400 }
      );
    }

    const result = await getChatbot(chatbotId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json({
      chatbot: result.chatbot,
      persona: result.persona,
    });
  } catch (error: any) {
    console.error("Error fetching chatbot:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
