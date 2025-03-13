import { type KindeConfig } from "@kinde-oss/kinde-auth-nextjs";
import { cookies } from "next/headers";

// Create a custom cookie store for state management
const cookieStore = {
  get: async (key: string) => {
    return cookies().get(key)?.value;
  },
  set: async (key: string, value: string) => {
    // This will be handled by Kinde's built-in cookie management
    return;
  },
  delete: async (key: string) => {
    // This will be handled by Kinde's built-in cookie management
    return;
  },
};

export const authConfig: KindeConfig = {
  clientId: process.env.KINDE_CLIENT_ID!,
  clientSecret: process.env.KINDE_CLIENT_SECRET!,
  issuer: process.env.KINDE_ISSUER_URL!,
  redirectURL: process.env.KINDE_REDIRECT_URI,
  logoutURL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
  stateStore: {
    get: cookieStore.get,
    set: cookieStore.set,
    delete: cookieStore.delete,
  },
  audience: process.env.KINDE_AUDIENCE,
  scope: "openid profile email offline",
  sessionOptions: {
    // Configure session cookie options
    cookieName: "kinde_auth",
    password: process.env.SESSION_SECRET || process.env.KINDE_CLIENT_SECRET!, // Use a strong password
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  },
};
