"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Persona } from "@/models/Persona";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type PersonaFormData = {
  name: string;
  description?: string;
  traits?: string[];
  tone?: string;
  style?: string;
  expertise?: string[];
  imageUrl?: string;
};

/**
 * Server action to create a new persona
 */
export async function createPersona(formData: PersonaFormData) {
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

    // Create the persona
    const newPersona = await Persona.create({
      userId: user.id,
      name: formData.name.trim(),
      description: formData.description || "",
      traits: formData.traits || [],
      tone: formData.tone || "",
      style: formData.style || "",
      expertise: formData.expertise || [],
      imageUrl: formData.imageUrl || "",
    });

    // Revalidate any paths that might display personas
    revalidatePath("/personas");
    revalidatePath("/chatbots/create");

    return {
      success: true,
      message: "Persona created successfully",
      persona: newPersona,
      status: 201,
    };
  } catch (error: any) {
    console.error("Error creating persona:", error);
    return {
      success: false,
      message: error.message || "Failed to create persona",
      status: 500,
    };
  }
}

/**
 * Server action to get all personas for the current user
 */
export async function getUserPersonas() {
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

    // Get all personas for this user
    const personas = await Persona.query("userId").eq(user.id).exec();

    return {
      success: true,
      personas,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error fetching personas:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch personas",
      status: 500,
    };
  }
}
