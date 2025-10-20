/**
 * These routes don't require authentication
 * @type {string[]}
 */
export const publicRoutes: string[] = ["/", "/login", "/signup"];

/**
 * Protected routes that require authentication
 * @type {string[]}
 */
export const employeeRoutes = ["/dashboard"];

export const superadminRoutes: string[] = [
  "/admin",
  "/admin/settings",
  "/admin/users",
  "/admin/audit-logs",
  "/admin/analytics",
  "/admin/system-health",
  "/admin/bulk-operations",
  "/admin/security",
];
export const hrRoutes: string[] = [
  "/hr",
  "/attendance",
  "/department",
  "/leave-request",
  "/employees",
  "/reports",
  "/settings",
];

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
