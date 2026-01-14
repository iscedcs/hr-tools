import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { UserRole } from "./lib/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole;
        token.employeeCode = user.employeeCode;
        token.departmentId = user.departmentId;
        token.position = user.position;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.employeeCode = token.employeeCode as string;
        session.user.departmentId = token.departmentId as number;
        session.user.position = token.position as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  },
  ...authConfig,
});
