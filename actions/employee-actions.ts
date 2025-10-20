"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth-utils";

export async function createEmployee(formData: FormData) {
  try {
    await requireRole(["superadmin", "hr_admin"]);

    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const employeeCode = formData.get("employeeCode") as string;
    const role = formData.get("role") as "superadmin" | "hr_admin" | "employee";
    const departmentId = formData.get("departmentId") as string | null;
    const position = formData.get("position") as string | null;
    const phoneNumber = formData.get("phoneNumber") as string | null;
    const nfcCardId = formData.get("nfcCardId") as string | null;

    // Validate required fields
    if (!email || !name || !password || !employeeCode) {
      return { error: "Missing required fields" };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email already exists" };
    }

    // Check if employee code already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeCodeId: employeeCode },
    });

    if (existingEmployee) {
      return { error: "Employee code already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and employee in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeCodeId: employeeCode,
          role,
          departmentId: departmentId || undefined,
          position: position || undefined,
          phoneNumber: phoneNumber || undefined,
          nfcCardId: nfcCardId || undefined,
        },
      });

      return { user, employee };
    });

    revalidatePath("/hr/employees");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { error: "Failed to create employee" };
  }
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  try {
    await requireRole(["superadmin", "hr_admin"]);

    const name = formData.get("name") as string;
    const role = formData.get("role") as "superadmin" | "hr_admin" | "employee";
    const departmentId = formData.get("departmentId") as string | null;
    const position = formData.get("position") as string | null;
    const phoneNumber = formData.get("phoneNumber") as string | null;
    const nfcCardId = formData.get("nfcCardId") as string | null;
    const isActive = formData.get("isActive") === "true";

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true, employeeCode: true },
    });

    if (!employee) {
      return { error: "Employee not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: employee.userId },
        data: { name },
      });

      await tx.employee.update({
        where: { id: employeeId },
        data: {
          role,
          departmentId: departmentId || null,
          position: position || null,
          phoneNumber: phoneNumber || null,
          nfcCardId: nfcCardId || null,
          isActive,
        },
      });
    });

    revalidatePath("/hr/employees");
    return { success: true };
  } catch (error) {
    console.error("Error updating employee:", error);
    return { error: "Failed to update employee" };
  }
}

export async function deactivateEmployee(employeeId: string) {
  try {
    await requireRole(["superadmin", "hr_admin"]);

    await prisma.employee.update({
      where: { id: employeeId },
      data: { isActive: false },
    });

    revalidatePath("/hr/employees");
    return { success: true };
  } catch (error) {
    console.error("Error deactivating employee:", error);
    return { error: "Failed to deactivate employee" };
  }
}

export async function activateEmployee(employeeId: string) {
  try {
    await requireRole(["superadmin", "hr_admin"]);

    await prisma.employee.update({
      where: { id: employeeId },
      data: { isActive: true },
    });

    revalidatePath("/hr/employees");
    return { success: true };
  } catch (error) {
    console.error("Error activating employee:", error);
    return { error: "Failed to activate employee" };
  }
}
