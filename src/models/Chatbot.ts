import * as dynamoose from "dynamoose";
import * as crypto from "crypto";

const chatbotSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: () => crypto.randomUUID(),
    },
    userId: {
      type: String,
      required: true,
      index: {
        name: "userIdIndex",
        type: "global",
      },
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    personaId: {
      type: String,
    },
    imageUrl: String,
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    interactions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: false,
  }
);

// Create the model with a consistent name
export const Chatbot = dynamoose.model("Chatbot", chatbotSchema);

// Export a function to get the model to avoid "Critical dependency" errors
export function getChatbotModel() {
  return Chatbot;
}
