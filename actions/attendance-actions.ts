"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function checkInAction(location?: string) {
  try {
    const session = await requireAuth();

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return { error: "Employee record not found" };
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: employee.id,
        checkInTime: { gte: today },
        status: "checked_in",
      },
    });

    if (existingCheckIn) {
      return { error: "You are already checked in for today" };
    }

    await prisma.attendanceLog.create({
      data: {
        employeeId: employee.id,
        checkInTime: new Date(),
        status: "checked_in",
        checkInLocation: location || null,
        checkInMethod: "manual",
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Checked in successfully!" };
  } catch (error) {
    console.error(" Check-in error:", error);
    return { error: "Failed to check in. Please try again." };
  }
}

export async function checkOutAction(location?: string, notes?: string) {
  try {
    const session = await requireAuth();

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return { error: "Employee record not found" };
    }

    // Find today's check-in record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInRecord = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: employee.id,
        checkInTime: { gte: today },
        status: "checked_in",
      },
      orderBy: { checkInTime: "desc" },
    });

    if (!checkInRecord) {
      return { error: "No active check-in found for today" };
    }

    const checkOutTime = new Date();
    const totalHours =
      (checkOutTime.getTime() - checkInRecord.checkInTime.getTime()) /
      (1000 * 60 * 60);

    await prisma.attendanceLog.update({
      where: { id: checkInRecord.id },
      data: {
        checkOutTime: checkOutTime,
        status: "checked_out",
        checkOutLocation: location || null,
        checkOutMethod: "manual",
        notes: notes || null,
        totalHours: Number.parseFloat(totalHours.toFixed(2)),
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Checked out successfully!" };
  } catch (error) {
    console.error(" Check-out error:", error);
    return { error: "Failed to check out. Please try again." };
  }
}

export async function getTodayAttendance(userId: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return { error: "Employee record not found" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: employee.id,
        checkInTime: { gte: today },
      },
      orderBy: { checkInTime: "desc" },
    });

    return { data: attendance || null, error: null };
  } catch (error) {
    console.error(" Get today attendance error:", error);
    return { data: null, error: "Failed to fetch attendance" };
  }
}

export async function getRecentAttendance(userId: string, limit = 10) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return { error: "Employee record not found" };
    }

    const attendance = await prisma.attendanceLog.findMany({
      where: { employeeId: employee.id },
      orderBy: { checkInTime: "desc" },
      take: limit,
    });

    return { data: attendance, error: null };
  } catch (error) {
    console.error(" Get recent attendance error:", error);
    return { data: null, error: "Failed to fetch attendance history" };
  }
}
