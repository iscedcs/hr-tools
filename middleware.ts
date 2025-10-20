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

export default auth((req) => {
  const { nextUrl } = req;

  const pathname = nextUrl.pathname;

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
    if (userRole === "superadmin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    } else if (userRole === "hr_admin" || userRole === "hr") {
      return NextResponse.redirect(new URL("/hr", req.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 2. Redirect non-logged-in users to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
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
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  // console.log("userRole", userRole); // temp

  if (isSuperadminRoute && userRole !== "superadmin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (isHRRoute && userRole !== "hr_admin" && userRole !== "superadmin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
