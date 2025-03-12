"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Chatbot } from "@/models/Chatbot";
import { Persona } from "@/models/Persona";
import { revalidatePath } from "next/cache";
import { DatabaseService } from "@/services/database.service";

export type ChatbotFormData = {
  name: string;
  description?: string;
  visibility: "public" | "private";
  personaId: string;
  imageUrl?: string;
};

/**
 * Server action to create a new chatbot
 */
export async function createChatbot(formData: ChatbotFormData) {
  try {
    // Verify authentication
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return { success: false, message: "Not authenticated", status: 401 };
    }

    const user = await getUser();
    if (!user || !user.id) {
      return { success: false, message: "User not found", status: 404 };
    }

    // Validate required fields
    if (!formData.name || formData.name.trim() === "") {
      return { success: false, message: "Name is required", status: 400 };
    }

    if (!formData.personaId) {
      return { success: false, message: "Persona is required", status: 400 };
    }

    // Verify the persona exists and belongs to the user
    try {
      const persona = await Persona.get(formData.personaId);
      if (!persona) {
        return { success: false, message: "Persona not found", status: 404 };
      }

      // Check if the persona belongs to this user
      if (persona.userId !== user.id) {
        return {
          success: false,
          message: "You don't have permission to use this persona",
          status: 403,
        };
      }
    } catch (error) {
      return { success: false, message: "Invalid persona", status: 400 };
    }

    // Create the chatbot
    const newChatbot = await Chatbot.create({
      userId: user.id,
      name: formData.name.trim(),
      description: formData.description || "",
      visibility: formData.visibility || "private",
      personaId: formData.personaId,
      imageUrl: formData.imageUrl || "",
    });

    // Revalidate paths that might display chatbots
    revalidatePath("/chatbots");
    revalidatePath("/");

    return {
      success: true,
      message: "Chatbot created successfully",
      chatbot: newChatbot,
      status: 201,
    };
  } catch (error: any) {
    console.error("Error creating chatbot:", error);
    return {
      success: false,
      message: error.message || "Failed to create chatbot",
      status: 500,
    };
  }
}

/**
 * Get all public chatbots
 */
export async function getPublicChatbots() {
  try {
    // Use a scan with filter to get all public chatbots
    const chatbots = await Chatbot.scan("visibility").eq("public").exec();

    // Get user information for each chatbot
    const enhancedChatbots = await Promise.all(
      chatbots.map(async (chatbot) => {
        try {
          // Import User model dynamically to avoid circular dependencies
          const { User } = await import("@/models/User");

          // Try to get the user
          const user = await User.get(chatbot.userId);

          // Return chatbot with user information
          return {
            ...chatbot,
            username: user ? user.username : "Anonymous",
          };
        } catch (error) {
          // If user not found, return chatbot with default username
          return {
            ...chatbot,
            username: "Anonymous",
          };
        }
      })
    );

    return {
      success: true,
      chatbots: enhancedChatbots,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error fetching public chatbots:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch public chatbots",
      status: 500,
    };
  }
}

/**
 * Get all chatbots for the current user
 */
export async function getUserChatbots() {
  try {
    // Verify authentication
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return { success: false, message: "Not authenticated", status: 401 };
    }

    const user = await getUser();
    if (!user || !user.id) {
      return { success: false, message: "User not found", status: 404 };
    }

    // Get all chatbots for this user
    const chatbots = await Chatbot.query("userId").eq(user.id).exec();

    return {
      success: true,
      chatbots,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error fetching user chatbots:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch user chatbots",
      status: 500,
    };
  }
}

/**
 * Get a chatbot by ID, respecting visibility permissions
 */
export async function getChatbot(chatbotId: string) {
  try {
    // Verify authentication for user-specific access checks
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();
    const user = authenticated ? await getUser() : null;

    // Get the chatbot
    const chatbot = await Chatbot.get(chatbotId);

    if (!chatbot) {
      return { success: false, message: "Chatbot not found", status: 404 };
    }

    // Check access permissions
    if (
      chatbot.visibility === "private" &&
      (!user || chatbot.userId !== user.id)
    ) {
      return {
        success: false,
        message: "You don't have permission to access this chatbot",
        status: 403,
      };
    }

    // Get the associated persona
    const persona = await Persona.get(chatbot.personaId);

    return {
      success: true,
      chatbot,
      persona,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error fetching chatbot:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch chatbot",
      status: 500,
    };
  }
}

/**
 * Update a chatbot's image URL
 */
export async function updateChatbotImage(chatbotId: string, imageUrl: string) {
  try {
    // Use absolute URL instead of relative URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      window.location.origin ||
      "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/chatbots/update-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatbotId, imageUrl }),
      credentials: "include", // Include cookies for authentication
      cache: "no-store", // Prevent caching
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error response from update-image API:", data);

      // Handle authentication errors specifically
      if (response.status === 401) {
        return {
          success: false,
          message: "Authentication required. Please sign in again.",
          status: 401,
        };
      }

      return {
        success: false,
        message: data.error || "Failed to update chatbot image",
        status: response.status,
      };
    }

    return {
      success: true,
      message: "Chatbot image updated successfully",
      chatbot: data.chatbot,
    };
  } catch (error: any) {
    console.error("Error updating chatbot image:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
      status: 500,
    };
  }
}

/**
 * Toggle a chatbot's visibility between public and private
 */
export async function toggleChatbotVisibility(
  chatbotId: string,
  visibility: "public" | "private"
) {
  try {
    // Verify authentication
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return { success: false, message: "Not authenticated", status: 401 };
    }

    const user = await getUser();
    if (!user || !user.id) {
      return { success: false, message: "User not found", status: 404 };
    }

    // Get the chatbot
    const chatbot = await Chatbot.get(chatbotId);
    if (!chatbot) {
      return { success: false, message: "Chatbot not found", status: 404 };
    }

    // Verify ownership
    if (chatbot.userId !== user.id) {
      return {
        success: false,
        message: "Not authorized to update this chatbot",
        status: 403,
      };
    }

    // Update the chatbot visibility
    chatbot.visibility = visibility;
    await chatbot.save();

    return { success: true, chatbot };
  } catch (error) {
    console.error("Error updating chatbot visibility:", error);
    return {
      success: false,
      message: "Failed to update chatbot visibility",
      status: 500,
    };
  }
}

/**
 * Delete a chatbot
 */
export async function deleteChatbot(chatbotId: string) {
  try {
    // Verify authentication
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return { success: false, message: "Not authenticated", status: 401 };
    }

    const user = await getUser();
    if (!user || !user.id) {
      return { success: false, message: "User not found", status: 404 };
    }

    // Get the chatbot
    const chatbot = await Chatbot.get(chatbotId);
    if (!chatbot) {
      return { success: false, message: "Chatbot not found", status: 404 };
    }

    // Verify ownership
    if (chatbot.userId !== user.id) {
      return {
        success: false,
        message: "Not authorized to delete this chatbot",
        status: 403,
      };
    }

    // Delete the chatbot
    await Chatbot.delete(chatbotId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting chatbot:", error);
    return { success: false, message: "Failed to delete chatbot", status: 500 };
  }
}

/**
 * Remove a chatbot's image
 */
export async function removeChatbotImage(chatbotId: string) {
  try {
    // Verify authentication
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return { success: false, message: "Not authenticated", status: 401 };
    }

    const user = await getUser();
    if (!user || !user.id) {
      return { success: false, message: "User not found", status: 404 };
    }

    // Get the chatbot
    const chatbot = await Chatbot.get(chatbotId);
    if (!chatbot) {
      return { success: false, message: "Chatbot not found", status: 404 };
    }

    // Verify ownership
    if (chatbot.userId !== user.id) {
      return {
        success: false,
        message: "Not authorized to update this chatbot",
        status: 403,
      };
    }

    // Update the chatbot to remove the image URL
    chatbot.imageUrl = undefined; // Use undefined instead of null
    await chatbot.save();

    // Revalidate the paths
    revalidatePath("/settings");
    revalidatePath("/chatbots");
    revalidatePath(`/chatbots/${chatbotId}`);

    return { success: true, chatbot };
  } catch (error) {
    console.error("Error removing chatbot image:", error);
    return {
      success: false,
      message: "Failed to remove chatbot image",
      status: 500,
    };
  }
}

/**
 * Generate a new image for a chatbot using AI
 */
export async function generateChatbotImage(
  chatbotId: string,
  prompt?: string,
  modelKey: string = "stability-sdxl"
) {
  try {
    // Use the provided prompt or default to a generic one
    const imagePrompt =
      prompt || "A futuristic AI assistant, digital art style";

    console.log("Generating image with prompt:", imagePrompt);
    console.log("Model key:", modelKey);
    console.log("Chatbot ID:", chatbotId);

    // IMPORTANT: Use a simple string URL without any dynamic construction
    const response = await fetch("/api/images/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt?.trim() || imagePrompt,
        modelKey: modelKey,
      }),
    });
    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data.success ? "Success" : "Failed");

    if (!response.ok) {
      console.error("Error response from generate-image API:", data);

      // Handle authentication errors specifically
      if (response.status === 401) {
        return {
          success: false,
          message: "Authentication required. Please sign in again.",
          status: 401,
        };
      }

      return {
        success: false,
        message: data.error || "Failed to generate chatbot image",
        status: response.status,
      };
    }

    // Check if we have images in the response (similar to images page)
    if (data.images && data.images.length > 0) {
      // Use the first image URL
      const imageUrl = data.images[0].url;

      // Update the chatbot with the new image URL
      await updateChatbotImage(chatbotId, imageUrl);

      return {
        success: true,
        imageUrl: imageUrl,
        message: "Image generated and saved successfully.",
      };
    } else if (data.imageUrl) {
      // If the API returns a single imageUrl property
      await updateChatbotImage(chatbotId, data.imageUrl);

      return {
        success: true,
        imageUrl: data.imageUrl,
        message: "Image generated and saved successfully.",
      };
    } else {
      return {
        success: false,
        message: "No image was generated",
        status: 500,
      };
    }
  } catch (error: any) {
    console.error("Error generating chatbot image:", error);

    // Provide more detailed error information
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    }

    return {
      success: false,
      message: error.message || "An unexpected error occurred",
      status: 500,
    };
  }
}

/**
 * Update a chatbot's details
 */
export async function updateChatbot(data: {
  id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  visibility?: "public" | "private";
}) {
  try {
    // Verify authentication
    const { getUser, isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return { success: false, message: "Not authenticated", status: 401 };
    }

    const user = await getUser();
    if (!user || !user.id) {
      return { success: false, message: "User not found", status: 404 };
    }

    // Get the chatbot
    const chatbot = await Chatbot.get(data.id);
    if (!chatbot) {
      return { success: false, message: "Chatbot not found", status: 404 };
    }

    // Verify ownership
    if (chatbot.userId !== user.id) {
      return { success: false, message: "Not authorized", status: 403 };
    }

    // Update fields
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;

    // Update the chatbot
    await Chatbot.update(data.id, updateData);

    // Revalidate paths
    revalidatePath(`/chatbots/${data.id}`);
    revalidatePath(`/chatbots/${data.id}/settings`);
    revalidatePath("/chatbots");

    return { success: true, message: "Chatbot updated successfully" };
  } catch (error: any) {
    console.error("Error updating chatbot:", error);
    return {
      success: false,
      message: error.message || "Failed to update chatbot",
      status: 500,
    };
  }
}
