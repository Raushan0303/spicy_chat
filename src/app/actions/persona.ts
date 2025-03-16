"use server";

import { currentUser } from "@clerk/nextjs/server";
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
    const user = await currentUser();

    if (!user) {
      return { success: false, message: "Not authenticated", status: 401 };
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
 * Helper function to convert Dynamoose model to plain object
 */
function serializePersona(persona: any) {
  if (!persona) return null;

  // Convert to plain object
  return {
    id: persona.id,
    name: persona.name || "",
    description: persona.description || "",
    traits: persona.traits || [],
    tone: persona.tone || "",
    style: persona.style || "",
    expertise: persona.expertise || [],
    userId: persona.userId || "",
    imageUrl: persona.imageUrl || "",
    createdAt: persona.createdAt || null,
    updatedAt: persona.updatedAt || null,
  };
}

/**
 * Server action to get all personas for the current user
 */
export async function getUserPersonas() {
  try {
    // Verify authentication
    const user = await currentUser();

    if (!user) {
      return { success: false, message: "Not authenticated", status: 401 };
    }

    // Get all personas for this user
    const personas = await Persona.query("userId").eq(user.id).exec();

    // Serialize the personas to plain objects
    const serializedPersonas = personas
      .map((persona) => serializePersona(persona))
      .filter(Boolean);

    return {
      success: true,
      personas: serializedPersonas,
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
