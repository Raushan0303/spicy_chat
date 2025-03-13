import { NextRequest } from "next/server";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default function middleware(req: NextRequest) {
  // Only apply authentication to protected routes
  const path = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/chatbots", "/api/chatbots"];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) =>
      path === route ||
      (path.startsWith(`${route}/`) && !path.includes("/create"))
  );

  // Skip authentication for public routes
  if (isPublicRoute) {
    return;
  }

  // Apply authentication for protected routes
  return withAuth(req);
}

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/chats/:path*",
    "/personas/:path*",
    "/chatbots/create/:path*",
    "/personas/create/:path*",
    "/api/chat/:path*",
    "/api/images/generate/:path*",

    // Exclude public routes
    "/((?!_next/static|_next/image|favicon.ico|assets|api/chatbots/[^/]+$).*)",
  ],
};
