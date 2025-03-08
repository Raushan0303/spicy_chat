import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";

// Extend NextRequest with kindeAuth property
declare module "next/server" {
  interface NextRequest {
    kindeAuth?: any;
  }
}

// Define a type for the token
interface KindeToken {
  permissions: string[];
}

export default withAuth(async function middleware(req: NextRequest) {
  // You can add custom middleware logic here if needed
});

export const config = {
  matcher: [
    // Protect these routes - require authentication
    "/dashboard/:path*",
    "/api/chatbots/:path*",
    "/api/personas/:path*",
    "/api/chats/:path*",
    // Don't protect these routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
