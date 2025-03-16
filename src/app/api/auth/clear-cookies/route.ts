import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Clear cookies endpoint called via GET");

    // Get all cookies from the request
    const allCookies = request.cookies.getAll();
    console.log(
      "Current cookies:",
      allCookies.map((c) => c.name)
    );

    // Create a response
    const response = new NextResponse(
      JSON.stringify({
        success: true,
        message: "Cookies cleared successfully",
        clearedCookies: [],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // List of auth-related cookies to clear
    const authCookies = [
      "ac-state-key",
      "post_login_redirect_url",
      "kinde_state",
      "kinde_token",
      "kinde_auth",
      "kinde_user",
      "__Secure-next-auth.session-token",
      "__Host-next-auth.csrf-token",
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",
      // Add any other cookies you want to clear
    ];

    // If no specific cookies are targeted, clear all cookies except Next.js system cookies
    if (authCookies.length === 0) {
      allCookies.forEach((cookie) => {
        if (!cookie.name.startsWith("__next")) {
          response.cookies.set({
            name: cookie.name,
            value: "",
            expires: new Date(0),
            path: "/",
          });
        }
      });
    } else {
      // Clear specific auth cookies with multiple paths
      const paths = ["/", "/api", "/api/auth", "/auth"];

      authCookies.forEach((cookieName) => {
        paths.forEach((path) => {
          response.cookies.set({
            name: cookieName,
            value: "",
            expires: new Date(0),
            path: path,
            sameSite: "lax",
          });
        });
      });
    }

    // Add HTML with JavaScript to clear client-side cookies as well
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clearing Cookies</title>
        <script>
          // List of cookies to clear
          const cookiesToClear = ${JSON.stringify(authCookies)};
          
          // Log what we're doing
          console.log("Clearing cookies client-side:", cookiesToClear);
          
          // Try to clear cookies with different paths and domains
          const paths = ["/", "/api", "/api/auth", "/auth", ""];
          cookiesToClear.forEach(cookieName => {
            paths.forEach(path => {
              document.cookie = \`\${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=\${path}\`;
              document.cookie = \`\${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=\${path};domain=\${window.location.hostname}\`;
              document.cookie = \`\${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=\${path};domain=.\${window.location.hostname}\`;
            });
          });
          
          // Clear localStorage and sessionStorage
          try {
            localStorage.removeItem("kinde_state");
            sessionStorage.removeItem("kinde_state");
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {
            console.error("Error clearing storage:", e);
          }
          
          // Log current cookies
          console.log("Current cookies after clearing:", document.cookie);
          
          // Redirect back after a short delay
          setTimeout(() => {
            window.location.href = document.referrer || "/";
          }, 1000);
        </script>
      </head>
      <body>
        <h1>Clearing Cookies...</h1>
        <p>This page will clear your authentication cookies and redirect you back.</p>
        <p>If you are not redirected automatically, <a href="/">click here</a>.</p>
      </body>
      </html>
    `;

    // Return HTML instead of JSON
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error clearing cookies:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
