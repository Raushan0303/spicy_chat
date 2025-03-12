import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createChatbot } from "@/app/actions/chatbot";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!body.personaId) {
      return NextResponse.json(
        { error: "Persona is required" },
        { status: 400 }
      );
    }

    // Use the existing server action to create the chatbot
    const result = await createChatbot({
      name: body.name,
      description: body.description || "",
      visibility: body.visibility === "public" ? "public" : "private",
      personaId: body.personaId,
      imageUrl: body.imageUrl || "",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error in chatbots API:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
