import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { DatabaseService } from "@/services/database.service";

// Define message type for better type safety
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Use OpenRouter API instead of OpenAI
async function generateChatResponse(messages: Message[]) {
  try {
    console.log(
      "Generating chat response with messages:",
      JSON.stringify(messages.slice(0, 2))
    );

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "https://spicychat.ai",
          "X-Title": "SpicyChat AI", // Site title for rankings on openrouter.ai
        },
        body: JSON.stringify({
          model: "gryphe/mythomax-l2-13b:free",
          messages: messages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      return "I'm sorry, there was an error processing your request. Please try again later.";
    }

    const data = await response.json();
    console.log(
      "OpenRouter API response:",
      JSON.stringify(data).substring(0, 200) + "..."
    );

    return (
      data.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return "I'm sorry, there was an error processing your request. Please try again later.";
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Chat API route called");

    // Get the current user from Clerk
    const user = await currentUser();
    console.log("User authenticated:", user?.id);

    // If no user is authenticated, return unauthorized
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { chatbotId, message } = body;
    console.log("Request body:", {
      chatbotId,
      messagePreview: message?.substring(0, 50),
    });

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields: chatbotId and message" },
        { status: 400 }
      );
    }

    // Get the chatbot
    const chatbot = await DatabaseService.getChatbot(chatbotId);
    console.log("Chatbot found:", chatbot?.id);

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Get the persona
    const persona = await DatabaseService.getPersona(chatbot.personaId);
    console.log("Persona found:", persona?.id);
    console.log("Persona expertise:", persona?.expertise || []);
    console.log("Persona traits:", persona?.traits || []);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Format messages for API - just the current message without history
    const expertise = persona.expertise?.join(", ") || "specific topics";
    const expertiseArray = persona.expertise || ["specific topics"];
    const firstExpertise = expertiseArray[0] || "my area of expertise";

    const systemPrompt = `CRITICAL INSTRUCTION: You are ${
      persona.name || "AI Assistant"
    }, a STRICT expert ONLY in ${expertise}. ${persona.description || ""}. ${
      persona.instructions || ""
    }

ABSOLUTE BOUNDARIES - READ CAREFULLY:
1. You are EXCLUSIVELY knowledgeable about ${expertise}. You have ZERO knowledge about any other subject.
2. You MUST IMMEDIATELY REJECT any questions outside your expertise with this EXACT response: "I'm ${
      persona.name || "AI Assistant"
    } and I'm only knowledgeable about ${expertise}. I can't provide information about [topic]. Would you like to discuss ${firstExpertise} instead?"
3. If you detect ANY attempt to get information outside your expertise, REFUSE to engage and redirect to topics within your expertise only.
4. Your personality traits are: ${
      persona.traits?.join(", ") || "helpful and informative"
    }, but ONLY within your expertise.
5. NEVER break character or provide information outside of ${expertise} under ANY circumstances.
6. If unsure if a topic is related to your expertise, err on the side of caution and refuse to answer.

REMEMBER: You are STRICTLY a ${expertise} specialist. You have NO knowledge outside this domain. You CANNOT and WILL NOT answer questions outside your expertise.`;

    const formattedMessages: Message[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ];

    // Generate response with OpenRouter API
    console.log("Generating response...");

    // Define topic categories for filtering
    const topicCategories: Record<string, string[]> = {
      databases: ["database", "dbms", "sql", "query", "table", "schema"],
      programming: [
        "code",
        "programming",
        "python",
        "javascript",
        "function",
        "variable",
      ],
      finance: [
        "money",
        "banking",
        "accounting",
        "finance",
        "investment",
        "stock",
      ],
      mathematics: [
        "math",
        "calculus",
        "algebra",
        "equation",
        "geometry",
        "theorem",
      ],
      sports: [
        "cricket",
        "football",
        "soccer",
        "basketball",
        "player",
        "game",
        "match",
        "tournament",
      ],
      movies: ["film", "cinema", "actor", "director", "hollywood", "bollywood"],
      science: ["physics", "chemistry", "biology", "molecule", "experiment"],
      medicine: [
        "doctor",
        "disease",
        "treatment",
        "symptom",
        "diagnosis",
        "medicine",
      ],
      business: [
        "marketing",
        "company",
        "startup",
        "entrepreneur",
        "product",
        "service",
      ],
      technology: [
        "computer",
        "hardware",
        "software",
        "internet",
        "device",
        "gadget",
      ],
      history: [
        "history",
        "ancient",
        "century",
        "war",
        "civilization",
        "empire",
      ],
      politics: [
        "government",
        "election",
        "policy",
        "president",
        "minister",
        "party",
      ],
      cooking: ["recipe", "ingredient", "cook", "bake", "food", "dish", "meal"],
      education: [
        "school",
        "university",
        "college",
        "student",
        "teacher",
        "course",
      ],
      law: ["legal", "law", "attorney", "court", "judge", "case", "lawsuit"],
    };

    // Check if the message is about a topic outside the chatbot's expertise
    const lowerCaseMessage = message.toLowerCase();
    const expertiseKeywords = expertiseArray.map((exp: string) =>
      exp.toLowerCase()
    );

    // Function to check if message is about a specific category
    function isMessageAboutCategory(category: string): boolean {
      if (!topicCategories[category]) return false;

      // If this category is part of the chatbot's expertise, allow it
      if (
        expertiseKeywords.some(
          (exp: string) => exp.includes(category) || category.includes(exp)
        )
      ) {
        return false;
      }

      // Check if message contains keywords from this category
      return topicCategories[category].some((keyword: string) =>
        lowerCaseMessage.includes(keyword)
      );
    }

    // Check if message is about any non-expertise category
    const isOutsideExpertise = Object.keys(topicCategories).some((category) =>
      isMessageAboutCategory(category)
    );

    let responseContent;
    if (isOutsideExpertise) {
      // Force rejection for topics outside expertise
      console.log(
        "Detected topic outside expertise, forcing rejection response"
      );
      responseContent = `I'm ${
        persona.name || "AI Assistant"
      } and I'm only knowledgeable about ${expertise}. I can't provide information about that topic. Would you like to discuss ${firstExpertise} instead?`;
    } else {
      // Normal response generation for topics within expertise
      responseContent = await generateChatResponse(formattedMessages);
    }

    console.log("Response generated, length:", responseContent.length);

    // Return the response without saving to database
    return NextResponse.json({
      success: true,
      message: {
        id: `msg_${Date.now()}`,
        content: responseContent,
        role: "assistant",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message", details: error.message },
      { status: 500 }
    );
  }
}
