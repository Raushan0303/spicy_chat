"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 bg-gray-900 rounded-lg max-w-md">
        <h1 className="text-2xl font-bold text-white mb-4">
          Authentication Error
        </h1>

        {reason === "redirect_loop" ? (
          <div className="mb-6">
            <p className="text-red-400 mb-4">Redirect Loop Detected</p>
            <p className="text-gray-400 mb-6">
              The authentication process is stuck in a redirect loop. This is
              likely due to a configuration issue.
            </p>
            <div className="bg-gray-800 p-4 rounded-md mb-6 text-left">
              <p className="text-yellow-400 font-semibold mb-2">
                Possible solutions:
              </p>
              <ul className="text-gray-400 text-sm list-disc pl-5 space-y-2">
                <li>
                  Check your{" "}
                  <code className="bg-gray-700 px-1 rounded">.env.local</code>{" "}
                  file and ensure{" "}
                  <code className="bg-gray-700 px-1 rounded">
                    KINDE_REDIRECT_URL
                  </code>{" "}
                  is set to{" "}
                  <code className="bg-gray-700 px-1 rounded">
                    http://localhost:3000/api/auth/callback
                  </code>
                </li>
                <li>Clear your browser cookies and cache</li>
                <li>Restart your development server</li>
                <li>Check your Kinde dashboard settings</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Sorry, there was a problem authenticating your request. This could
              be due to:
            </p>
            <ul className="text-gray-400 mb-6 text-left list-disc pl-6">
              <li>An expired or invalid session</li>
              <li>Missing authentication parameters</li>
              <li>A temporary issue with the authentication service</li>
              <li>Incorrect OAuth provider configuration</li>
              <li>Mismatched callback URLs</li>
            </ul>
            <div className="bg-gray-800 p-4 rounded-md mb-6 text-left">
              <p className="text-yellow-400 font-semibold mb-2">
                Troubleshooting:
              </p>
              <p className="text-gray-400 text-sm">
                Check your server logs for detailed error information. The error
                has been logged with specific details that can help identify the
                issue.
              </p>
            </div>
          </>
        )}

        <p className="text-gray-400 mb-6">
          Please try again or contact support if the problem persists.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Return to Home
            </Button>
          </Link>

          <Link href="/auth/test">
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              Auth Test
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
