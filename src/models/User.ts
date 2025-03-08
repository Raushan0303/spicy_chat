import * as dynamoose from "dynamoose";
import * as crypto from "crypto";

const userSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: () => crypto.randomUUID(),
    },
    email: {
      type: String,
      required: true,
      index: {
        name: "emailIndex",
        type: "global",
      },
    },
    username: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    tokens: {
      type: Number,
      default: 0,
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

export const User = dynamoose.model("User", userSchema);
