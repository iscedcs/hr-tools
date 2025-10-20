"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole } from "@/lib/auth-utils";

export async function createLeaveRequest(formData: FormData) {
  try {
    const session = await requireAuth();

    const employee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      include: { employeeCode: true },
    });

    if (!employee) {
      return { error: "Employee not found" };
    }

    const leaveType = formData.get("leaveType") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const reason = formData.get("reason") as string | null;

    if (!leaveType || !startDate || !endDate) {
      return { error: "Missing required fields" };
    }

    // Calculate total days
    const totalDays =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    if (totalDays <= 0) {
      return { error: "End date must be after start date" };
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason: reason || undefined,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/hr/leave-requests");
    return { success: true, data: leaveRequest };
  } catch (error) {
    console.error("Error creating leave request:", error);
    return { error: "Failed to create leave request" };
  }
}

export async function approveLeaveRequest(leaveRequestId: string) {
  try {
    const session = await requireRole(["superadmin", "hr_admin"]);

    const employee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return { error: "Employee not found" };
    }

    await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: "approved",
        approvedBy: employee.id,
        approvedAt: new Date(),
      },
    });

    revalidatePath("/hr/leave-requests");
    return { success: true };
  } catch (error) {
    console.error("Error approving leave request:", error);
    return { error: "Failed to approve leave request" };
  }
}

export async function rejectLeaveRequest(
  leaveRequestId: string,
  rejectionReason: string
) {
  try {
    const session = await requireRole(["superadmin", "hr_admin"]);

    const employee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return { error: "Employee not found" };
    }

    await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: "rejected",
        approvedBy: employee.id,
        approvedAt: new Date(),
        rejectionReason,
      },
    });

    revalidatePath("/hr/leave-requests");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting leave request:", error);
    return { error: "Failed to reject leave request" };
  }
}
