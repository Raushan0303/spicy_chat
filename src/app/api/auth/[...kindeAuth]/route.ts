import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

// Use a more robust approach to handle Kinde auth
export const GET = handleAuth();
