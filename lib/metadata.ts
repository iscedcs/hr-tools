import type { Metadata } from "next";

interface RouteMetadata {
  title: string;
  description: string;
  keywords?: string[];
}

const routeMetadataMap: Record<string, RouteMetadata> = {
  "/": {
    title: "ISCE HR Management System",
    description: "Comprehensive HR management and attendance tracking system",
    keywords: ["HR", "attendance", "management", "employee"],
  },
  "/login": {
    title: "Login | ISCE HR Management",
    description: "Sign in to your HR management account",
    keywords: ["login", "sign in", "authentication"],
  },
  "/signup": {
    title: "Sign Up | ISCE HR Management",
    description: "Create your HR management account",
    keywords: ["signup", "register", "create account"],
  },
  "/dashboard": {
    title: "Dashboard | ISCE HR Management",
    description:
      "Employee dashboard - View your attendance, leaves, and profile",
    keywords: ["dashboard", "employee", "attendance"],
  },
  "/hr": {
    title: "HR Dashboard | ISCE HR Management",
    description:
      "HR admin dashboard for managing employees, attendance, and reports",
    keywords: ["HR", "admin", "dashboard", "management"],
  },
  "/admin": {
    title: "Admin Dashboard | ISCE HR Management",
    description: "Super admin dashboard for system administration and settings",
    keywords: ["admin", "superadmin", "system", "administration"],
  },
  "/attendance": {
    title: "Attendance Management | ISCE HR Management",
    description: "Track and manage employee attendance records",
    keywords: ["attendance", "tracking", "time", "records"],
  },
  "/employees": {
    title: "Employee Management | ISCE HR Management",
    description: "Manage employee profiles, documents, and information",
    keywords: ["employees", "profiles", "management"],
  },
  "/reports": {
    title: "Reports | ISCE HR Management",
    description: "View and generate HR reports and analytics",
    keywords: ["reports", "analytics", "statistics"],
  },
  "/settings": {
    title: "Settings | ISCE HR Management",
    description: "Configure your account and system settings",
    keywords: ["settings", "configuration", "preferences"],
  },
  "/unauthorized": {
    title: "Unauthorized Access | ISCE HR Management",
    description: "You don't have permission to access this resource",
    keywords: ["unauthorized", "access denied"],
  },
};

/**
 * Generate dynamic metadata based on the current pathname
 */
export function generateMetadata(pathname: string): Metadata {
  // Find exact match first
  let metadata = routeMetadataMap[pathname];

  // If no exact match, try to find a partial match for nested routes
  if (!metadata) {
    const matchingRoute = Object.keys(routeMetadataMap).find((route) => {
      if (route === "/") return pathname === "/";
      return pathname.startsWith(route);
    });

    if (matchingRoute) {
      metadata = routeMetadataMap[matchingRoute];
    }
  }

  // Default metadata if no match found
  if (!metadata) {
    metadata = {
      title: "ISCE HR Management System",
      description: "Comprehensive HR management and attendance tracking system",
    };
  }

  // Generate title with site name
  const siteName = "ISCE HR Management";
  const fullTitle =
    metadata.title.includes(siteName) || pathname === "/"
      ? metadata.title
      : `${metadata.title} | ${siteName}`;

  return {
    title: {
      default: fullTitle,
      template: `%s | ${siteName}`,
    },
    description: metadata.description,
    keywords: metadata.keywords,
    authors: [{ name: "ISCE" }],
    creator: "ISCE",
    publisher: "ISCE",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://isce-hr.com",
      siteName,
      title: fullTitle,
      description: metadata.description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metadata.description,
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://isce-hr.com"
    ),
  };
}

/**
 * Get metadata for a specific route
 */
export function getRouteMetadata(pathname: string): RouteMetadata | undefined {
  return routeMetadataMap[pathname];
}
