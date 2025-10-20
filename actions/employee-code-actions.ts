"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Generate employee codes
const generateCodesSchema = z.object({
  count: z.number().min(1).max(100),
  prefix: z.string().optional(),
});

export async function generateEmployeeCodes(
  data: z.infer<typeof generateCodesSchema>
) {
  try {
    const { count, prefix = "EMP" } = generateCodesSchema.parse(data);

    const codes = [];
    for (let i = 0; i < count; i++) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const code = `${prefix}${randomNum}`;
      codes.push({
        code,
        assigned: false,
      });
    }

    await prisma.employeeCode.createMany({
      data: codes,
      skipDuplicates: true,
    });

    revalidatePath("/hr/employee-codes");
    return {
      success: true,
      message: `Generated ${count} employee codes successfully`,
    };
  } catch (error) {
    console.error("Error generating employee codes:", error);
    return { success: false, error: "Failed to generate employee codes" };
  }
}

// Get all employee codes
export async function getEmployeeCodes() {
  try {
    const codes = await prisma.employeeCode.findMany({
      include: {
        Employee: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            employeeCode: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: codes };
  } catch (error) {
    console.error("Error fetching employee codes:", error);
    return { success: false, error: "Failed to fetch employee codes" };
  }
}

// Assign code to employee
const assignCodeSchema = z.object({
  codeId: z.string(),
  employeeId: z.string(),
});

export async function assignEmployeeCode(
  data: z.infer<typeof assignCodeSchema>
) {
  try {
    const { codeId, employeeId } = assignCodeSchema.parse(data);

    // Check if employee already has a code
    const existingCode = await prisma.employeeCode.findFirst({
      where: { employeeId },
    });

    if (existingCode) {
      return { success: false, error: "Employee already has a code assigned" };
    }

    await prisma.employeeCode.update({
      where: { id: codeId },
      data: {
        assigned: true,
        assignedAt: new Date(),
        employeeId,
        assignedTo: employeeId,
      },
    });

    revalidatePath("/hr/employee-codes");
    return { success: true, message: "Code assigned successfully" };
  } catch (error) {
    console.error("Error assigning employee code:", error);
    return { success: false, error: "Failed to assign employee code" };
  }
}

// Unassign code from employee
export async function unassignEmployeeCode(codeId: string) {
  try {
    await prisma.employeeCode.update({
      where: { id: codeId },
      data: {
        assigned: false,
        assignedAt: null,
        employeeId: null,
        assignedTo: null,
      },
    });

    revalidatePath("/hr/employee-codes");
    return { success: true, message: "Code unassigned successfully" };
  } catch (error) {
    console.error("Error unassigning employee code:", error);
    return { success: false, error: "Failed to unassign employee code" };
  }
}

// Delete employee code
export async function deleteEmployeeCode(codeId: string) {
  try {
    // Check if code is assigned
    const code = await prisma.employeeCode.findUnique({
      where: { id: codeId },
    });

    if (code?.assigned) {
      return {
        success: false,
        error: "Cannot delete assigned code. Unassign it first.",
      };
    }

    await prisma.employeeCode.delete({
      where: { id: codeId },
    });

    revalidatePath("/hr/employee-codes");
    return { success: true, message: "Code deleted successfully" };
  } catch (error) {
    console.error("Error deleting employee code:", error);
    return { success: false, error: "Failed to delete employee code" };
  }
}

// Bulk delete unassigned codes
export async function bulkDeleteUnassignedCodes() {
  try {
    const result = await prisma.employeeCode.deleteMany({
      where: { assigned: false },
    });

    revalidatePath("/hr/employee-codes");
    return {
      success: true,
      message: `Deleted ${result.count} unassigned codes`,
    };
  } catch (error) {
    console.error("Error bulk deleting codes:", error);
    return { success: false, error: "Failed to delete codes" };
  }
}
