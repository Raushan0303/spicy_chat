import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getChatbotModel } from "@/models/Chatbot";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { chatbotId, imageUrl } = body;

    // Get authentication from Kinde, passing the request object
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    console.log("Authentication status:", authenticated);

    if (!authenticated) {
      console.error("User is not authenticated");
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in again.",
        },
        { status: 401 }
      );
    }

    // Get the user with the request context
    const user = await getUser();
    console.log(
      "User from session:",
      user ? `ID: ${user.id}` : "No user found"
    );

    if (!user || !user.id) {
      console.error("No user ID found in session");
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in again.",
        },
        { status: 401 }
      );
    }

    if (!chatbotId) {
      return NextResponse.json(
        {
          success: false,
          error: "Chatbot ID is required",
        },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Image URL is required",
        },
        { status: 400 }
      );
    }

    // Get the authenticated user ID
    const authenticatedUserId = user.id;
    console.log(`Authenticated user ID: ${authenticatedUserId}`);
    console.log(`Updating image for chatbot: ${chatbotId}`);

    // Get the chatbot model
    const Chatbot = getChatbotModel();

    // Get the chatbot
    const chatbot = await Chatbot.get(chatbotId);

    if (!chatbot) {
      console.error(`Chatbot not found: ${chatbotId}`);
      return NextResponse.json(
        {
          success: false,
          error: "Chatbot not found",
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (chatbot.userId !== authenticatedUserId) {
      console.error(
        `User ${authenticatedUserId} is not authorized to update chatbot ${chatbotId} owned by ${chatbot.userId}`
      );
      return NextResponse.json(
        {
          success: false,
          error: "Not authorized to update this chatbot",
        },
        { status: 403 }
      );
    }

    // Update the chatbot image
    chatbot.imageUrl = imageUrl;
    await chatbot.save();

    // Revalidate the paths to ensure the changes are reflected across the app
    revalidatePath("/settings");
    revalidatePath("/chatbots");
    revalidatePath(`/chatbots/${chatbotId}`);

    return NextResponse.json({
      success: true,
      message: "Chatbot image updated successfully",
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        imageUrl: chatbot.imageUrl,
      },
    });
  } catch (error: any) {
    console.error("Error updating chatbot image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
