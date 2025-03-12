import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Chatbot } from "@/models/Chatbot";
import { Persona } from "@/models/Persona";

// Define the OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Use the environment variable, with fallback to the hardcoded key
const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  "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";

export async function POST(request: NextRequest) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();
    const user = authenticated ? await getUser() : null;

    // Parse the request body
    const body = await request.json();
    const { chatbotId, message, messageHistory = [] } = body;

    if (!chatbotId || !message) {
      return NextResponse.json(
        {
          error: "Missing required fields: chatbotId and message are required",
        },
        { status: 400 }
      );
    }

    // Get the chatbot
    const chatbot = await Chatbot.get(chatbotId);
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Check permissions for private chatbots
    if (
      chatbot.visibility === "private" &&
      (!user || chatbot.userId !== user.id)
    ) {
      return NextResponse.json(
        { error: "You don't have permission to chat with this chatbot" },
        { status: 403 }
      );
    }

    // Get the associated persona
    const persona = await Persona.get(chatbot.personaId);
    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Construct the system message with persona details
    const systemMessage = `You are ${
      chatbot.name
    }, a chatbot with the following characteristics:
Description: ${chatbot.description || "No specific description"}
Persona traits: ${
      persona.traits ? persona.traits.join(", ") : "No specific traits"
    }
Tone: ${persona.tone || "Conversational"}
Style: ${persona.style || "Helpful and friendly"}
Expertise: ${
      persona.expertise ? persona.expertise.join(", ") : "General knowledge"
    }

IMPORTANT INSTRUCTIONS:
1. You must STRICTLY stay within your defined expertise and persona. 
2. If a user asks a question outside your expertise or persona, politely inform them that the question is outside your knowledge domain.
3. Refuse to answer questions that don't align with your persona or expertise.
4. Always maintain your defined tone and style in all responses.
5. Begin your refusal with "I'm sorry, but as ${
      chatbot.name
    } with expertise in [your expertise], I cannot answer questions about [topic outside expertise]."

You should respond in a way that reflects these characteristics. Be engaging, helpful, and stay in character at all times.`;

    // Prepare the conversation history for the API
    const messages = [
      { role: "system", content: systemMessage },
      ...messageHistory,
      { role: "user", content: message },
    ];

    console.log(
      "Calling OpenRouter API with messages:",
      JSON.stringify(messages, null, 2)
    );

    // Call the OpenRouter API with MythoMax model
    const openRouterResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "https://spicychat.ai",
        "X-Title": "SpicyChat AI",
      },
      body: JSON.stringify({
        model: "gryphe/mythomax-l2-13b:free", // MythoMax model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json().catch(() => ({}));
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get a response from the AI model" },
        { status: 500 }
      );
    }

    const data = await openRouterResponse.json();
    console.log("OpenRouter API response:", JSON.stringify(data, null, 2));

    // Check if we have a valid response with choices
    if (!data.choices || !data.choices.length || !data.choices[0].message) {
      console.error("Invalid response format from OpenRouter API:", data);
      return NextResponse.json(
        { error: "Invalid response format from AI model" },
        { status: 500 }
      );
    }

    // Return the AI response
    return NextResponse.json({
      message: data.choices[0].message.content,
      chatbotName: chatbot.name,
      persona: {
        name: persona.name,
        tone: persona.tone,
        style: persona.style,
      },
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
