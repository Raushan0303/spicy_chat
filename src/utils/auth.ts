/**
 * Clears all authentication-related cookies from the browser
 */
export function clearAuthCookies(): void {
  // Clear specific known auth cookies with all possible domain and path combinations
  const cookiesToClear = [
    "__session",
    "__client",
    "ac-state-key",
    "post_login_redirect_url",
    "auth-token",
  ];

  // Clear each cookie with various path and domain combinations
  cookiesToClear.forEach((name) => {
    // Clear with path=/
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Clear with path=/api
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api;`;
    // Clear with domain and path
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    // Clear with secure flag
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;
  });

  // Get all cookies and clear any that might be related to authentication
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const cookieName = cookie.split("=")[0];

    if (
      cookieName.toLowerCase().includes("auth") ||
      cookieName.toLowerCase().includes("token") ||
      cookieName.toLowerCase().includes("clerk") ||
      cookieName.toLowerCase().includes("session")
    ) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    }
  }

  // Also try to clear localStorage and sessionStorage
  try {
    // Clear any auth-related items from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.toLowerCase().includes("auth") ||
          key.toLowerCase().includes("token") ||
          key.toLowerCase().includes("clerk") ||
          key.toLowerCase().includes("session"))
      ) {
        localStorage.removeItem(key);
      }
    }

    // Clear any auth-related items from sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (
        key &&
        (key.toLowerCase().includes("auth") ||
          key.toLowerCase().includes("token") ||
          key.toLowerCase().includes("clerk") ||
          key.toLowerCase().includes("session"))
      ) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error("Error clearing storage:", e);
  }
}

/**
 * Performs a complete logout by clearing cookies and redirecting to the logout endpoint
 */
export function performLogout(): void {
  // Clear all auth cookies
  clearAuthCookies();

  // Create a timestamp to prevent caching
  const timestamp = new Date().getTime();

  // Redirect to the logout endpoint
  window.location.href = `/api/auth/logout?t=${timestamp}`;
}

/**
 * Forces a refresh of the authentication state by reloading the page
 */
export function refreshAuthState(): void {
  // Create a timestamp to prevent caching
  const timestamp = new Date().getTime();

  // Force reload with cache busting
  window.location.href = `${window.location.pathname}?t=${timestamp}`;
}
