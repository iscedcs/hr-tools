import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/types";

export async function getSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  const userRole = session.user.role as UserRole;

  if (!allowedRoles.includes(userRole)) {
    redirect("/unauthorized");
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export function isAdmin(role: UserRole) {
  return role === "superadmin" || role === "hr_admin";
}
