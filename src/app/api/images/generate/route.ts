import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

// Define the Hugging Face API endpoint for inference
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Available models for image generation with correct Hugging Face model IDs
const AVAILABLE_MODELS = {
  "stability-sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
  "stability-sdxl-turbo": "stabilityai/sdxl-turbo",
  "playground-v2": "playgroundai/playground-v2-1024px-aesthetic",
} as const;

// Define a type for the model keys
type ModelKey = keyof typeof AVAILABLE_MODELS;

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user using Clerk
    const user = await currentUser();
    console.log("user", user);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { prompt, modelKey = "stability-sdxl" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Validate the model key
    if (typeof modelKey !== "string" || !(modelKey in AVAILABLE_MODELS)) {
      return NextResponse.json(
        {
          error: `Invalid model key. Valid options are: ${Object.keys(
            AVAILABLE_MODELS
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Get the model ID from our mapping
    const model = AVAILABLE_MODELS[modelKey as ModelKey];

    console.log(`Generating image with Hugging Face model: ${model}`);
    console.log(`Prompt: "${prompt}"`);

    // Call the Hugging Face API
    const response = await fetch(`${HUGGINGFACE_API_URL}/${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, bad quality, distorted, disfigured",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    });

    // Log the response status
    console.log(`Response status: ${response.status} ${response.statusText}`);

    // Handle error responses
    if (!response.ok) {
      const errorMessage = `API Error: ${response.status} ${response.statusText}`;
      let errorDetails = {};

      try {
        const errorText = await response.text();
        console.error("Hugging Face API error response:", errorText);

        try {
          if (errorText) {
            errorDetails = JSON.parse(errorText);
          }
        } catch (parseError) {
          console.error("Failed to parse error JSON:", parseError);
        }
      } catch (e) {
        console.error("Failed to read error response:", e);
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
        },
        { status: 500 }
      );
    }

    // For Hugging Face, the response is the image data directly
    const imageBuffer = await response.arrayBuffer();

    // Convert to base64
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    // Return the image data
    return NextResponse.json({
      images: [
        {
          url: dataUrl,
          prompt,
          model: modelKey,
        },
      ],
    });
  } catch (error: any) {
    console.error("Error in image generation API:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
