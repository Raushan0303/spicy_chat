import { cookies } from "next/headers";
import { encrypt, decrypt } from "./crypto";

// Secret key for encrypting session data
// In production, use a strong, randomly generated key stored in environment variables
const SECRET_KEY =
  process.env.SESSION_SECRET_KEY || "your-secret-key-min-32-chars-long-here";

export interface SessionData {
  state?: string;
  codeVerifier?: string;
  [key: string]: any;
}

export const sessionStore = {
  /**
   * Get session data from cookie
   */
  get(): SessionData {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("kinde_auth_session");

    if (!sessionCookie?.value) {
      return {};
    }

    try {
      const decrypted = decrypt(sessionCookie.value, SECRET_KEY);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error("Failed to decrypt session cookie:", error);
      return {};
    }
  },

  /**
   * Save session data to cookie
   */
  set(data: SessionData): void {
    const cookieStore = cookies();
    const encrypted = encrypt(JSON.stringify(data), SECRET_KEY);

    // Set cookie with HttpOnly, Secure flags and appropriate expiration
    cookieStore.set("kinde_auth_session", encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  },

  /**
   * Clear session data
   */
  destroy(): void {
    const cookieStore = cookies();
    cookieStore.delete("kinde_auth_session");
  },
};
