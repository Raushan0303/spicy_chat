import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getChatbotModel } from "@/models/Chatbot";
import { revalidatePath } from "next/cache";

// Hugging Face API endpoint and key
const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Available models
const MODELS = {
  "stability-sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
  "stability-sdxl-turbo": "stabilityai/sdxl-turbo",
  dalle3: "openai/dall-e-3",
};

type ModelKey = keyof typeof MODELS;

export async function POST(request: NextRequest) {
  console.log("Generate image API route called");

  try {
    // Get the authenticated user using Clerk
    const user = await currentUser();
    console.log("user", user);

    // Log cookie information for debugging
    try {
      const cookieHeader = request.headers.get("cookie");
      console.log("Cookie header:", cookieHeader ? "Present" : "Missing");
      if (cookieHeader) {
        console.log("Cookie header length:", cookieHeader.length);
        console.log("Cookie header preview:", cookieHeader.substring(0, 100));
      }
    } catch (e) {
      console.error("Error accessing cookies:", e);
    }

    // More detailed user logging
    console.log("User object:", user ? "Present" : "Missing");

    if (user) {
      console.log("User ID:", user.id ? user.id : "Missing");
      console.log(
        "User email:",
        user.emailAddresses[0]?.emailAddress
          ? user.emailAddresses[0].emailAddress
          : "Missing"
      );
    } else {
      console.error("No user object found in session");
    }

    if (!user || !user.id) {
      console.error("Authentication required: No user found in session");
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in again.",
        },
        { status: 401 }
      );
    }

    console.log("Authenticated user:", user.id);

    // Parse the request body
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed successfully");
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const { prompt, modelKey, chatbotId } = body;

    console.log("Request body:", {
      prompt: prompt ? "Present" : "Missing",
      modelKey: modelKey || "Not provided",
      chatbotId: chatbotId || "Not provided",
    });

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required",
        },
        { status: 400 }
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

    // Validate model key
    if (!modelKey || !MODELS[modelKey as ModelKey]) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid model key",
        },
        { status: 400 }
      );
    }

    const model = MODELS[modelKey as ModelKey];
    console.log(`Generating image with model ${model} for prompt: ${prompt}`);
    console.log(`User ID: ${user.id}, Chatbot ID: ${chatbotId}`);

    // Special case for DALL-E 3 which isn't available on Hugging Face
    if (modelKey === "dalle3") {
      // For now, we'll use SDXL as a fallback
      console.log("DALL-E 3 not available, using SDXL as fallback");
      const fallbackModel = MODELS["stability-sdxl"];

      // Call Hugging Face API with the fallback model
      const response = await fetch(`${HF_API_URL}/${fallbackModel}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          options: {
            use_cache: false,
            wait_for_model: true,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Error from Hugging Face API:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to generate image",
          },
          { status: response.status }
        );
      }

      // Get the image data
      const imageData = await response.arrayBuffer();
      const base64Image = Buffer.from(imageData).toString("base64");
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      // If chatbotId is provided, update the chatbot image directly
      try {
        // Get the chatbot model
        const Chatbot = getChatbotModel();
        console.log("Chatbot model loaded successfully");

        // Get the chatbot
        console.log(`Attempting to get chatbot with ID: ${chatbotId}`);
        let chatbot;
        try {
          chatbot = await Chatbot.get(chatbotId);
          console.log(`Chatbot retrieved: ${chatbot ? "Yes" : "No"}`);
        } catch (error: any) {
          console.error(
            `Error retrieving chatbot with ID ${chatbotId}:`,
            error
          );
          return NextResponse.json(
            {
              success: false,
              error: `Error retrieving chatbot: ${
                error.message || "Unknown error"
              }`,
            },
            { status: 500 }
          );
        }

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

        console.log(
          `Chatbot user ID: ${chatbot.userId}, Current user ID: ${user.id}`
        );
        if (chatbot.userId !== user.id) {
          console.error(
            `User ${user.id} is not authorized to update chatbot ${chatbotId} owned by ${chatbot.userId}`
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
        console.log(`Updating chatbot image for ${chatbotId}`);
        try {
          chatbot.imageUrl = imageUrl;
          await chatbot.save();
          console.log(`Chatbot image updated successfully`);
        } catch (error: any) {
          console.error(`Error saving chatbot image:`, error);
          return NextResponse.json(
            {
              success: false,
              error: `Error saving chatbot image: ${
                error.message || "Unknown error"
              }`,
            },
            { status: 500 }
          );
        }

        // Revalidate paths
        try {
          revalidatePath("/settings");
          revalidatePath("/chatbots");
          revalidatePath(`/chatbots/${chatbotId}`);
          console.log("Paths revalidated successfully");
        } catch (error: any) {
          console.error("Error revalidating paths:", error);
          // Continue despite revalidation errors
        }

        console.log(`Successfully updated chatbot image for ${chatbotId}`);
      } catch (error) {
        console.error("Error directly updating chatbot image:", error);
        // Log detailed error information
        if (error instanceof Error) {
          console.error(`Error name: ${error.name}, message: ${error.message}`);
          console.error(`Stack trace: ${error.stack}`);
        }

        // Return the image URL anyway, even if updating the chatbot failed
        return NextResponse.json({
          success: true,
          imageUrl,
          message: "Image generated successfully, but failed to update chatbot",
        });
      }

      return NextResponse.json({
        success: true,
        imageUrl,
        message:
          "Image generated successfully (using SDXL as fallback for DALL-E 3)",
      });
    }

    // Call Hugging Face API to generate image
    const response = await fetch(`${HF_API_URL}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: {
          use_cache: false,
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error from Hugging Face API:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate image",
        },
        { status: response.status }
      );
    }

    // Get the image data
    const imageData = await response.arrayBuffer();
    const base64Image = Buffer.from(imageData).toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    // Update the chatbot image directly
    try {
      // Get the chatbot model
      const Chatbot = getChatbotModel();
      console.log("Chatbot model loaded successfully");

      // Get the chatbot
      console.log(`Attempting to get chatbot with ID: ${chatbotId}`);
      let chatbot;
      try {
        chatbot = await Chatbot.get(chatbotId);
        console.log(`Chatbot retrieved: ${chatbot ? "Yes" : "No"}`);
      } catch (error: any) {
        console.error(`Error retrieving chatbot with ID ${chatbotId}:`, error);
        return NextResponse.json(
          {
            success: false,
            error: `Error retrieving chatbot: ${
              error.message || "Unknown error"
            }`,
          },
          { status: 500 }
        );
      }

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

      console.log(
        `Chatbot user ID: ${chatbot.userId}, Current user ID: ${user.id}`
      );
      if (chatbot.userId !== user.id) {
        console.error(
          `User ${user.id} is not authorized to update chatbot ${chatbotId} owned by ${chatbot.userId}`
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
      console.log(`Updating chatbot image for ${chatbotId}`);
      try {
        chatbot.imageUrl = imageUrl;
        await chatbot.save();
        console.log(`Chatbot image updated successfully`);
      } catch (error: any) {
        console.error(`Error saving chatbot image:`, error);
        return NextResponse.json(
          {
            success: false,
            error: `Error saving chatbot image: ${
              error.message || "Unknown error"
            }`,
          },
          { status: 500 }
        );
      }

      // Revalidate paths
      try {
        revalidatePath("/settings");
        revalidatePath("/chatbots");
        revalidatePath(`/chatbots/${chatbotId}`);
        console.log("Paths revalidated successfully");
      } catch (error: any) {
        console.error("Error revalidating paths:", error);
        // Continue despite revalidation errors
      }

      console.log(`Successfully updated chatbot image for ${chatbotId}`);
    } catch (error) {
      console.error("Error directly updating chatbot image:", error);
      // Log detailed error information
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}, message: ${error.message}`);
        console.error(`Stack trace: ${error.stack}`);
      }

      // Return the image URL anyway, even if updating the chatbot failed
      return NextResponse.json({
        success: true,
        imageUrl,
        message: "Image generated successfully, but failed to update chatbot",
      });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Image generated successfully",
    });
  } catch (error: any) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
