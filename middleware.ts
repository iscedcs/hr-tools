import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
  publicRoutes,
  superadminRoutes,
  hrRoutes,
  employeeRoutes,
} from "./routes";

function extractRole(authObj: any): string | null {
  if (!authObj) return null;
  if (authObj.user?.role) return String(authObj.user.role);
  if (Array.isArray(authObj.user?.roles) && authObj.user.roles.length)
    return String(authObj.user.roles[0]);
  if (authObj.token?.role) return String(authObj.token.role);
  if (authObj.role) return String(authObj.role);
  return null;
}

// Helper function to add security headers to any response
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  return response;
}

export default auth((req) => {
  const { nextUrl } = req;

  const pathname = nextUrl.pathname;

  // Add pathname to headers for dynamic metadata generation
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const isLoggedIn = !!req.auth;
  // console.log("middleware - req.auth:", JSON.stringify(req.auth));
  // console.log("middleware - pathname:", pathname);
  // const userRole = req.auth?.user?.role;

  const rawRole = extractRole(req.auth);
  const userRole = rawRole ? rawRole.toLowerCase() : null;

  // Check if public route
  const isPublicRoute = publicRoutes.some((route) => {
    // "/" should match only the root exact path, not every path
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });

  // 1. Redirect logged-in users away from auth pages
  if (isLoggedIn && isPublicRoute) {
    let redirectUrl: URL;
    if (userRole === "superadmin") {
      redirectUrl = new URL("/admin", req.url);
    } else if (userRole === "hr_admin" || userRole === "hr") {
      redirectUrl = new URL("/hr", req.url);
    } else {
      redirectUrl = new URL("/dashboard", req.url);
    }
    return addSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  // 2. Redirect non-logged-in users to login
  if (!isLoggedIn && !isPublicRoute) {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/login", req.url))
    );
  }

  // 3. Role-based route protection
  const isSuperadminRoute = superadminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isHRRoute = hrRoutes.some((route) => pathname.startsWith(route));

  const isEmployeeRoute = employeeRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isEmployeeRoute && userRole !== "employee") {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/unauthorized", req.url))
    );
  }
  // console.log("userRole", userRole); // temp

  if (isSuperadminRoute && userRole !== "superadmin") {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/unauthorized", req.url))
    );
  }

  if (isHRRoute && userRole !== "hr_admin" && userRole !== "superadmin") {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/unauthorized", req.url))
    );
  }

  // Add security headers to response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return addSecurityHeaders(response);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
