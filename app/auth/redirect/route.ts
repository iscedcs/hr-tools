import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

/**
 * Server-side handler: read session via your auth() wrapper (getSession)
 * and redirect to the appropriate role home page.
 */
export async function GET(request: Request) {
  const session = await getSession();

  if (!session?.user) {
    // Not authenticated — redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = (session.user.role || "").toString().toLowerCase();

  if (role === "superadmin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (role === "hr_admin" || role === "hr") {
    return NextResponse.redirect(new URL("/hr", request.url));
  }

  // Default for employees and other roles
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
