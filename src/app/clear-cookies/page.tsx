import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export default function ClearCookiesPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Clearing Cookies...</h1>
      <p>
        This page will clear your authentication cookies and redirect you back.
      </p>
      <p>
        If you are not redirected automatically,{" "}
        <a href="/" className="text-blue-500 underline">
          click here
        </a>
        .
      </p>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // List of cookies to clear
            const cookiesToClear = [
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
              "next-auth.callback-url"
            ];
            
            // Log what we're doing
            console.log("Clearing cookies:", cookiesToClear);
            
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
          `,
        }}
      />
    </div>
  );
}
