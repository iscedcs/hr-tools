import Credentials from "next-auth/providers/credentials";
import prisma from "./lib/db";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // @ts-expect-error
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
              deletedAt: null,
            },
            include: {
              employee: {
                include: {
                  department: true,
                  employeeCode: true,
                },
              },
            },
          });

          if (!user || !user.employee) {
            return null;
          }

          const password = user.password;

          if (!password) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            password
          );

          if (!isValidPassword) {
            return null;
          }

          // Check if employee is active
          if (!user.employee.isActive) {
            throw new Error("Your account has been deactivated");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.employee.role,
            employeeCode: user.employee.employeeCode?.code || "N/A",
            departmentId: user.employee.departmentId ?? undefined,
            position: user.employee.position,
          };
        } catch (error) {
          console.error(" Auth error:", error);
          return null;
        }
      },
    }),
  ],
};
export default authConfig;
