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
      required: true,
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
  },
  {
    saveUnknown: false,
  }
);

export const Chatbot = dynamoose.model("Chatbot", chatbotSchema);
