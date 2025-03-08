import * as dynamoose from "dynamoose";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { User } from "@/models/User";
import { Chatbot } from "@/models/Chatbot";
import { Persona } from "@/models/Persona";
import { Chat } from "@/models/Chat";

async function tableExists(model: any) {
  try {
    await model.table().describe();
    return true;
  } catch (error) {
    return false;
  }
}

export async function initializeDatabase() {
  console.log("Setting up AWS DynamoDB...");
  const ddb = new DynamoDB({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
    region: process.env.AWS_REGION || "us-east-1",
  });

  dynamoose.aws.ddb.set(ddb);

  // Create tables only if they don't exist
  const tables = [
    { model: User, name: "User" },
    { model: Chatbot, name: "Chatbot" },
    { model: Persona, name: "Persona" },
    { model: Chat, name: "Chat" },
  ];

  for (const table of tables) {
    try {
      if (!(await tableExists(table.model))) {
        console.log(`Creating ${table.name} table...`);
        await table.model.table().create();
        console.log(`${table.name} table created successfully`);
      } else {
        console.log(`${table.name} table already exists, skipping creation`);
      }
    } catch (error) {
      console.log(
        `Note: ${table.name} table creation skipped - ${
          (error as Error).message
        }`
      );
    }
  }

  console.log("Database initialization complete");
}
