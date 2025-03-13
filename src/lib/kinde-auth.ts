import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { sessionStore } from "./session-store";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Generate a random string for state and code verifier
function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

// Create a code challenge from a code verifier (for PKCE)
function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return hash;
}

export async function handleLogin(request: NextRequest) {
  const { getAuthorizationUrl } = getKindeServerSession();

  // Generate state and code verifier
  const state = generateRandomString(32);
  const codeVerifier = generateRandomString(64);

  // Store state and code verifier in session
  sessionStore.set({
    state,
    codeVerifier,
  });

  // Generate code challenge from code verifier
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Get authorization URL with state and code challenge
  const authorizationUrl = await getAuthorizationUrl({
    state,
    codeChallenge,
    codeChallengeMethod: "S256",
  });

  return NextResponse.redirect(authorizationUrl);
}

export async function handleCallback(request: NextRequest) {
  const { handleCallback } = getKindeServerSession();

  // Get URL parameters
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  // Get session data
  const sessionData = sessionStore.get();

  // Verify state
  if (!state || state !== sessionData.state) {
    console.error("State mismatch", {
      receivedState: state,
      expectedState: sessionData.state,
    });
    return NextResponse.json(
      {
        error:
          "Authentication flow: State mismatch. Received: " +
          state +
          " | Expected: " +
          sessionData.state,
      },
      { status: 400 }
    );
  }

  // Handle callback with code verifier
  const callbackResponse = await handleCallback({
    code: code || "",
    codeVerifier: sessionData.codeVerifier || "",
  });

  // Clear session after successful authentication
  sessionStore.destroy();

  return callbackResponse;
}

export async function handleLogout(request: NextRequest) {
  const { logout } = getKindeServerSession();

  // Clear session
  sessionStore.destroy();

  // Get logout URL
  const logoutUrl = await logout();

  return NextResponse.redirect(logoutUrl);
}
