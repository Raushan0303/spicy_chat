import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  isLoggedIn: boolean;
  state?: string;
  kindeState?: string;
}

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long",
  cookieName: "spicy_chat_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

// Function to generate and store state
export async function generateAndStoreState() {
  const session = await getSession();
  const state = Math.random().toString(36).substring(2);
  session.state = state;
  await session.save();
  return state;
}

// Function to verify state
export async function verifyState(state: string) {
  const session = await getSession();

  if (session.state !== state) {
    return false;
  }

  // Clear the state after successful verification
  session.state = undefined;
  await session.save();

  return true;
}
