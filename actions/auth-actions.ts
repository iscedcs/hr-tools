"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 8 characters"),
  employeeCode: z.string().max(9, "Employee code is required"),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string(),
  dateOfJoining: z.string(),
  resumptionDate: z.string(),
  employmentStatus: z.enum(["intern", "contract", "full_time"]),
});

export async function signUpAction(data: z.infer<typeof signUpSchema>) {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(data);

    const codeRecord = await prisma.employeeCode.findUnique({
      where: { code: validatedData.employeeCode },
    });

    if (!codeRecord) {
      return {
        error: "Invalid employee code. Please request a valid code from HR.",
      };
    }

    if (codeRecord.assigned) {
      return { error: "This employee code has already been used." };
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (existingUser && !existingUser.deletedAt) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id!,
          role: "employee",
          departmentId: validatedData.departmentId!,
          position: validatedData.position!,
          phoneNumber: validatedData.phoneNumber!,
          dateOfBirth: new Date(validatedData.dateOfBirth),
          dateOfJoining: new Date(validatedData.dateOfJoining),
          resumptionDate: new Date(validatedData.resumptionDate),
          employmentStatus: validatedData.employmentStatus,
          isActive: true,
          employeeCodeId: codeRecord.id,
        },
      });

      await tx.employeeCode.update({
        where: { id: codeRecord.id },
        data: {
          assigned: true,
          assignedTo: employee.id,
          assignedAt: new Date(),
          employeeId: employee.id,
        },
      });

      return user;
    });

    return { success: true, user: newUser };
  } catch (error) {
    console.error(" ❌ Sign up error:", error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to create account. Please try again." };
  }
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Initiates sign-in and lets NextAuth redirect the browser to /auth/redirect.
 * Use this from the client instead of doing getSession() client-side.
 */
export async function signInAction(email: string, password: string) {
  return signIn("credentials", {
    email,
    password,
    redirect: true,
    callbackUrl: "/auth/redirect",
  });
}
// export async function signInAction(email: string, password: string) {
//   try {
//     const result = await signIn("credentials", {
//       email,
//       password,
//       redirect: false,
//     });
//     if (result && (result as any).error) {
//       return { error: (result as any).error as string };
//     }

//     const session = await getSession();

//     if (!session?.user) {
//       // Defensive fallback - session may not be immediately available in rare cases
//       return { error: "Failed to retrieve session after sign-in" };
//     }

//     return { success: true, user: session.user };
//   } catch (error) {
//     console.error(" Sign in error:", error);
//     return { error: "Invalid email or password" };
//   }
// }

export async function signOutAction() {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.error(" Sign out error:", error);
    return { error: "Failed to sign out" };
  }
}
