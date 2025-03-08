import type { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export const authConfig: Parameters<typeof handleAuth>[0] = {
  clientId: process.env.KINDE_CLIENT_ID,
  clientSecret: process.env.KINDE_CLIENT_SECRET,
  issuer: process.env.KINDE_ISSUER_URL,
  redirectURL: process.env.KINDE_REDIRECT_URL,
  logoutURL: process.env.KINDE_LOGOUT_URL,
};
