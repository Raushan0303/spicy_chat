import * as dynamoose from "dynamoose";
import * as crypto from "crypto";

const personaSchema = new dynamoose.Schema(
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
    traits: {
      type: Array,
      schema: [String],
    },
    tone: String,
    style: String,
    expertise: {
      type: Array,
      schema: [String],
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

export const Persona = dynamoose.model("Persona", personaSchema);
