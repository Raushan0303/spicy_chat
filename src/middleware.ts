import { NextRequest } from "next/server";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import { sealData, unsealData } from "iron-session";
import { sessionOptions } from "./lib/session";
import { nanoid } from "nanoid";

// First handle the session middleware
async function sessionMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only handle Kinde auth-related routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    const cookieValue = request.cookies.get("spicy_chat_session")?.value;
    let session: { kindeState?: string } = {};

    if (cookieValue) {
      try {
        session = await unsealData(cookieValue, {
          password: sessionOptions.password,
        });
      } catch (error) {
        console.error("Failed to unseal session:", error);
      }
    }

    // If this is the start of the auth flow, generate and store a new state
    if (request.nextUrl.pathname === "/api/auth/login") {
      const state = nanoid();
      session.kindeState = state;
      const sealedSession = await sealData(session, {
        password: sessionOptions.password,
      });

      response.cookies.set(
        "spicy_chat_session",
        sealedSession,
        sessionOptions.cookieOptions
      );
    }

    // If this is the callback, verify the state
    if (request.nextUrl.pathname === "/api/auth/kinde_callback") {
      const returnedState = request.nextUrl.searchParams.get("state");
      const storedState = session.kindeState;

      // Log the states for debugging
      console.log("Returned state:", returnedState);
      console.log("Stored state:", storedState);

      if (!returnedState || !storedState || returnedState !== storedState) {
        console.error("State mismatch:", { returnedState, storedState });
        return new NextResponse(
          JSON.stringify({ error: "Invalid state parameter" }),
          { status: 400, headers: { "content-type": "application/json" } }
        );
      }

      // Clear the state after successful verification
      session.kindeState = undefined;
      const sealedSession = await sealData(session, {
        password: sessionOptions.password,
      });
      response.cookies.set(
        "spicy_chat_session",
        sealedSession,
        sessionOptions.cookieOptions
      );
    }
  }

  return response;
}

// Combine both middlewares
export default async function middleware(request: NextRequest) {
  // First run the session middleware
  const sessionResponse = await sessionMiddleware(request);
  if (sessionResponse.status !== 200) {
    return sessionResponse;
  }

  // Then run the Kinde auth middleware
  const config = {
    publicRoutes: [
      "/",
      "/api/chatbots/public",
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/kinde_callback",
    ],
  };

  return withAuth(request, config);
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
