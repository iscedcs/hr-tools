import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "./lib/types";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    employeeCode: string;
    departmentId?: number;
    position?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string;
      role: UserRole;
      employeeCode: string;
      departmentId?: number;
      position?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    employeeCode: string;
    departmentId?: number;
    position?: string;
  }
}
