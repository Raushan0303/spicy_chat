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

export class DatabaseService {
  // User operations
  static async createUser(userData: any) {
    return await User.create(userData);
  }

  static async getUserById(id: string) {
    return await User.get(id);
  }

  static async getOrCreateUser(userData: UserData) {
    try {
      // Try to find existing user
      let user = await User.get(userData.id);

      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          picture: userData.picture,
          tokens: 100, // Initial tokens for new users
        });
        await user.save();
        console.log("Created new user:", user.id);
      } else {
        // Update existing user if needed
        const updates: Record<string, any> = {};
        if (user.email !== userData.email) updates.email = userData.email;
        if (user.username !== userData.username)
          updates.username = userData.username;
        if (userData.picture && user.picture !== userData.picture)
          updates.picture = userData.picture;

        if (Object.keys(updates).length > 0) {
          Object.assign(user, updates);
          await user.save();
          console.log("Updated user:", user.id);
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
    return await Chatbot.create(chatbotData);
  }

  static async getChatbotsByUserId(userId: string) {
    return await Chatbot.query("userId").eq(userId).exec();
  }

  // Persona operations
  static async createPersona(personaData: any) {
    return await Persona.create(personaData);
  }

  static async getPersonasByUserId(userId: string) {
    return await Persona.query("userId").eq(userId).exec();
  }

  // Chat operations
  static async createChat(chatData: any) {
    return await Chat.create(chatData);
  }

  static async getChatHistory(chatbotId: string, userId: string) {
    return await Chat.query("chatbotId")
      .eq(chatbotId)
      .where("userId")
      .eq(userId)
      .exec();
  }

  static async addMessageToChat(chatId: string, message: any) {
    const chat = await Chat.get(chatId);
    chat.messages.push(message);
    chat.updatedAt = new Date().toISOString();
    return await chat.save();
  }
}
