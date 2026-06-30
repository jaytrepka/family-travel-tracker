import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session-config";

// Next.js 16 proxy always runs in Node.js runtime (no export const runtime needed)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const response = NextResponse.next();

    let isAdmin = false;
    try {
      const session = await getIronSession<SessionData>(request, response, sessionOptions);
      isAdmin = session.isAdmin === true;
    } catch {
      // If decryption fails for any reason, treat as unauthenticated
      isAdmin = false;
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
