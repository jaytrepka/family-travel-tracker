import { SessionOptions } from "iron-session";

export interface SessionData {
  isAdmin: boolean;
}

/**
 * Kept in a separate file with zero Next.js-specific imports so it can be
 * safely imported in both Node.js routes AND the proxy (Edge/Node runtime).
 */
export const sessionOptions: SessionOptions = {
  // iron-session requires the password at runtime — read lazily so it works
  // in all runtimes without import-time env access issues.
  get password() {
    return process.env.SESSION_SECRET ?? "fallback-dev-secret-change-in-prod-32chars!!";
  },
  cookieName: "travel-admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    // Stay logged in for 8 hours of inactivity, or until explicit logout
    maxAge: 60 * 60 * 8,
  },
};
