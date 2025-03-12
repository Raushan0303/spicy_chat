import { NextRequest, NextResponse } from "next/server";
import { deleteChatbot } from "@/app/actions/chatbot";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbotId = params.id;

    if (!chatbotId) {
      return NextResponse.json(
        { error: "Chatbot ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteChatbot(chatbotId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json({
      message: "Chatbot deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting chatbot:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
