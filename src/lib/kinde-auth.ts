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
  console.log("Starting login flow...");
  const { getAuthorizationUrl } = getKindeServerSession();

  // Generate state and code verifier
  const state = generateRandomString(32);
  const codeVerifier = generateRandomString(64);

  console.log("Generated state:", state);
  console.log("Generated codeVerifier:", codeVerifier.substring(0, 10) + "...");

  // Create session data
  const sessionData = {
    state,
    codeVerifier,
    timestamp: Date.now(),
  };

  // Get authorization URL with state and code challenge
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const authorizationUrl = await getAuthorizationUrl({
    state,
    codeChallenge,
    codeChallengeMethod: "S256",
  });

  console.log("Redirecting to authorization URL with state:", state);

  // Create response with redirect
  const response = NextResponse.redirect(authorizationUrl);

  // Store session data in the response
  return sessionStore.setInResponse(response, sessionData);
}

export async function handleCallback(request: NextRequest) {
  console.log("Processing callback...");
  const { handleCallback } = getKindeServerSession();

  // Get URL parameters
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  console.log("Received state:", state);
  console.log("Received code:", code?.substring(0, 10) + "...");

  // Get session data from request
  const sessionData = sessionStore.getFromRequest(request);
  console.log("Retrieved session data from request:", {
    hasState: !!sessionData.state,
    state: sessionData.state,
    hasCodeVerifier: !!sessionData.codeVerifier,
    timestamp: sessionData.timestamp,
    timeSinceCreation: sessionData.timestamp
      ? `${(Date.now() - sessionData.timestamp) / 1000}s`
      : "N/A",
  });

  // Verify state
  if (!state || state !== sessionData.state) {
    console.error("State mismatch", {
      receivedState: state,
      expectedState: sessionData.state,
      sessionDataKeys: Object.keys(sessionData),
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

  console.log("State verified successfully");

  // Handle callback with code verifier
  try {
    const callbackResponse = await handleCallback({
      code: code || "",
      codeVerifier: sessionData.codeVerifier || "",
    });

    // Clear session by setting an empty cookie
    const clearedResponse = sessionStore.setInResponse(callbackResponse, {});
    console.log("Authentication successful, session cleared");

    return clearedResponse;
  } catch (error) {
    console.error("Error handling callback:", error);
    return NextResponse.json(
      {
        error:
          "Authentication failed: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

export async function handleLogout(request: NextRequest) {
  console.log("Processing logout...");
  const { logout } = getKindeServerSession();

  // Get logout URL
  const logoutUrl = await logout();

  // Create response with redirect
  const response = NextResponse.redirect(logoutUrl);

  // Clear session by setting an empty cookie
  return sessionStore.setInResponse(response, {});
}
