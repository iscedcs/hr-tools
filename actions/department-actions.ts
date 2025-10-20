"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-utils";

export async function createDepartment(formData: FormData) {
  try {
    await requireRole(["superadmin", "hr_admin"]);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const managerId = formData.get("managerId") as string | null;

    if (!name) {
      return { error: "Department name is required" };
    }

    // Check if department name already exists
    const existingDepartment = await prisma.department.findFirst({
      where: { name },
    });

    if (existingDepartment) {
      return { error: "Department name already exists" };
    }

    const department = await prisma.department.create({
      data: {
        name,
        description: description || undefined,
        managerId: managerId || undefined,
      },
    });

    revalidatePath("/hr/departments");
    return { success: true, data: department };
  } catch (error) {
    console.error("Error creating department:", error);
    return { error: "Failed to create department" };
  }
}

export async function updateDepartment(
  departmentId: string,
  formData: FormData
) {
  try {
    await requireRole(["superadmin", "hr_admin"]);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const managerId = formData.get("managerId") as string | null;

    if (!name) {
      return { error: "Department name is required" };
    }

    await prisma.department.update({
      where: { id: departmentId },
      data: {
        name,
        description: description || null,
        managerId: managerId || null,
      },
    });

    revalidatePath("/hr/departments");
    return { success: true };
  } catch (error) {
    console.error("Error updating department:", error);
    return { error: "Failed to update department" };
  }
}

export async function deleteDepartment(departmentId: string) {
  try {
    await requireRole(["superadmin", "hr_admin"]);

    // Check if department has employees
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { employees: true },
    });

    if (!department) {
      return { error: "Department not found" };
    }

    if (department.employees.length > 0) {
      return {
        error:
          "Cannot delete department with employees. Please reassign employees first.",
      };
    }

    await prisma.department.delete({
      where: { id: departmentId },
    });

    revalidatePath("/hr/departments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { error: "Failed to delete department" };
  }
}
