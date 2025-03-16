import { User } from "@/models/User";
import { Chatbot } from "@/models/Chatbot";
import { Persona } from "@/models/Persona";
import { Chat } from "@/models/Chat";

type UserData = {
  id: string;
  email: string;
  username: string;
  picture?: string;
};

/**
 * Helper function to convert Dynamoose model to plain object
 */
function serializeToPlainObject(item: any) {
  if (!item) return null;

  // Convert to plain object
  return JSON.parse(JSON.stringify(item));
}

export class DatabaseService {
  // User operations
  static async createUser(userData: any) {
    const user = await User.create(userData);
    return serializeToPlainObject(user);
  }

  static async getUserById(id: string) {
    try {
      const user = await User.get(id);
      return serializeToPlainObject(user);
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  static async getOrCreateUser(userData: UserData) {
    try {
      // Try to find existing user
      let user;
      try {
        user = await User.get(userData.id);
        user = serializeToPlainObject(user);
      } catch (error) {
        user = null;
      }

      if (!user) {
        // Create new user if doesn't exist
        const newUser = new User({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          picture: userData.picture,
          tokens: 100, // Initial tokens for new users
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await newUser.save();
        console.log("Created new user:", userData.id);
        return serializeToPlainObject(newUser);
      } else {
        // Update existing user if needed
        const updates: Record<string, any> = {};
        if (user.email !== userData.email) updates.email = userData.email;
        if (user.username !== userData.username)
          updates.username = userData.username;
        if (userData.picture && user.picture !== userData.picture)
          updates.picture = userData.picture;

        if (Object.keys(updates).length > 0) {
          // Get the user again to update
          const userToUpdate = await User.get(userData.id);
          Object.assign(userToUpdate, updates, {
            updatedAt: new Date().toISOString(),
          });
          await userToUpdate.save();
          console.log("Updated user:", userData.id);
          return serializeToPlainObject(userToUpdate);
        }
      }

      return user;
    } catch (error) {
      console.error("Error in getOrCreateUser:", error);
      throw error;
    }
  }

  // Chatbot operations
  static async createChatbot(chatbotData: any) {
    const chatbot = await Chatbot.create(chatbotData);
    return serializeToPlainObject(chatbot);
  }

  static async getChatbotsByUserId(userId: string) {
    const chatbots = await Chatbot.query("userId").eq(userId).exec();
    return chatbots.map((chatbot) => serializeToPlainObject(chatbot));
  }

  // Persona operations
  static async createPersona(personaData: any) {
    const persona = await Persona.create(personaData);
    return serializeToPlainObject(persona);
  }

  static async getPersonasByUserId(userId: string) {
    const personas = await Persona.query("userId").eq(userId).exec();
    return personas.map((persona) => serializeToPlainObject(persona));
  }

  // Chat operations
  static async createChat(chatData: any) {
    const chat = await Chat.create(chatData);
    return serializeToPlainObject(chat);
  }

  static async getChatHistory(chatbotId: string, userId: string) {
    const chats = await Chat.query("chatbotId")
      .eq(chatbotId)
      .where("userId")
      .eq(userId)
      .exec();
    return chats.map((chat) => serializeToPlainObject(chat));
  }

  static async addMessageToChat(chatId: string, message: any) {
    const chat = await Chat.get(chatId);
    chat.messages.push(message);
    chat.updatedAt = new Date().toISOString();
    await chat.save();
    return serializeToPlainObject(chat);
  }
}
