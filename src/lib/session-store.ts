import { cookies } from "next/headers";
import { encrypt, decrypt } from "./crypto";
import { NextRequest, NextResponse } from "next/server";

// Secret key for encrypting session data
// In production, use a strong, randomly generated key stored in environment variables
const SECRET_KEY =
  process.env.SESSION_SECRET_KEY || "your-secret-key-min-32-chars-long-here";

// Cookie name
const COOKIE_NAME = "kinde_auth_session";

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
    try {
      console.log("Getting session data from cookie store");
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get(COOKIE_NAME);

      console.log("Cookie found:", !!sessionCookie);

      if (!sessionCookie?.value) {
        console.log("No session cookie found");
        return {};
      }

      console.log("Cookie value length:", sessionCookie.value.length);

      const decrypted = decrypt(sessionCookie.value, SECRET_KEY);
      console.log("Successfully decrypted cookie");

      const data = JSON.parse(decrypted);
      console.log("Session data keys:", Object.keys(data));

      return data;
    } catch (error) {
      console.error("Failed to get session data:", error);
      return {};
    }
  },

  /**
   * Save session data to cookie
   */
  set(data: SessionData): void {
    try {
      console.log("Setting session data:", Object.keys(data));
      const cookieStore = cookies();
      const encrypted = encrypt(JSON.stringify(data), SECRET_KEY);

      // Set cookie with HttpOnly, Secure flags and appropriate expiration
      cookieStore.set(COOKIE_NAME, encrypted, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      console.log("Session data set successfully");
    } catch (error) {
      console.error("Failed to set session data:", error);
    }
  },

  /**
   * Clear session data
   */
  destroy(): void {
    try {
      console.log("Destroying session data");
      const cookieStore = cookies();
      cookieStore.delete(COOKIE_NAME);
      console.log("Session data destroyed successfully");
    } catch (error) {
      console.error("Failed to destroy session data:", error);
    }
  },

  /**
   * Get session data from request
   */
  getFromRequest(request: NextRequest): SessionData {
    try {
      console.log("Getting session data from request");
      const sessionCookie = request.cookies.get(COOKIE_NAME);

      console.log("Cookie found in request:", !!sessionCookie);

      if (!sessionCookie?.value) {
        console.log("No session cookie found in request");
        return {};
      }

      console.log(
        "Cookie value length from request:",
        sessionCookie.value.length
      );

      const decrypted = decrypt(sessionCookie.value, SECRET_KEY);
      console.log("Successfully decrypted cookie from request");

      const data = JSON.parse(decrypted);
      console.log("Session data keys from request:", Object.keys(data));

      return data;
    } catch (error) {
      console.error("Failed to get session data from request:", error);
      return {};
    }
  },

  /**
   * Save session data to response
   */
  setInResponse(response: NextResponse, data: SessionData): NextResponse {
    try {
      console.log("Setting session data in response:", Object.keys(data));
      const encrypted = encrypt(JSON.stringify(data), SECRET_KEY);

      // Set cookie with HttpOnly, Secure flags and appropriate expiration
      response.cookies.set(COOKIE_NAME, encrypted, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      console.log("Session data set in response successfully");
      return response;
    } catch (error) {
      console.error("Failed to set session data in response:", error);
      return response;
    }
  },
};
