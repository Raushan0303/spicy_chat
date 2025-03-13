import { IronSessionOptions } from "iron-session";

export const sessionOptions: IronSessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long",
  cookieName: "spicy_chat_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
  },
};

// Extend the session type
declare module "iron-session" {
  interface IronSessionData {
    kindeState?: string;
    userId?: string;
  }
}
