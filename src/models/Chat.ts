import * as dynamoose from "dynamoose";
import * as crypto from "crypto";

const chatSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: () => crypto.randomUUID(),
    },
    chatbotId: {
      type: String,
      required: true,
      index: {
        name: "chatbotIdIndex",
        type: "global",
      },
    },
    userId: {
      type: String,
      required: true,
    },
    messages: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: {
            role: {
              type: String,
              enum: ["user", "assistant"],
            },
            content: String,
            timestamp: {
              type: String,
              default: () => new Date().toISOString(),
            },
          },
        },
      ],
    },
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

export const Chat = dynamoose.model("Chat", chatSchema);
