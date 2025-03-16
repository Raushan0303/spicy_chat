import * as dynamoose from "dynamoose";
import * as crypto from "crypto";

// Define the User schema
const userSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true, // Primary key
      required: true,
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
      required: false,
      default: "",
    },
    tokens: {
      type: Number,
      required: false,
      default: 100,
    },
    createdAt: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false, // We'll manage timestamps manually
  }
);

// Create the User model
export const User = dynamoose.model("User", userSchema);

// Export the User interface for TypeScript
export interface UserType {
  id: string;
  email: string;
  username: string;
  picture?: string;
  tokens?: number;
  createdAt: string;
  updatedAt: string;
}
