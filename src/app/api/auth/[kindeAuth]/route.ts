import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

// Export the GET handler using handleAuth
// This will handle all Kinde auth routes including login, logout, etc.
export const GET = handleAuth();
