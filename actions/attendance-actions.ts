"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { getDistanceInMeters } from "@/lib/distance";
import { OFFICE_LOCATION } from "@/lib/geofence";
import { PunctualityStatus } from "@prisma/client";
import { getTodayRange } from "@/lib/utils/getTodayRange";

export async function checkInAction(
  workMode: "IN_OFFICE" | "REMOTE",
  coords?: { lat: number; lng: number }
) {
  try {
    const session = await requireAuth();

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return { error: "Employee record not found" };
    }

    // Validate work mode requirements
    if (workMode === "IN_OFFICE") {
      if (!coords) {
        return {
          error: "Location permission required for in-office check-in!",
        };
      }

      const distance = getDistanceInMeters(
        coords.lat,
        coords.lng,
        OFFICE_LOCATION.lat,
        OFFICE_LOCATION.lng
      );

      if (distance > OFFICE_LOCATION.radiusMeters) {
        return {
          error: "You must be within FESTAC Tower premises to check in!",
        };
      }
    }

    const { start, end } = getTodayRange("Africa/Lagos");

    const existingCheckIn = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: employee.id,
        checkInTime: { gte: start, lt: end },
        status: "checked_in",
      },
    });

    if (existingCheckIn) {
      return { error: "You are already checked in for today" };
    }

   
    // Work resumption is 9am, and from 10:30am (1.5 hours after) it should be counted as late
    const workStartSetting = await prisma.systemSetting.findUnique({
      where: { settingKey: "work_hours_start" },
    });
    const workStartTime = workStartSetting?.settingValue || "09:00";
    const [hours, minutes] = workStartTime.split(":").map(Number);

    const checkInTime = new Date();
    const lateThreshold = new Date(checkInTime);
    lateThreshold.setHours(hours, minutes, 0, 0);
    lateThreshold.setMinutes(lateThreshold.getMinutes() + 90); // Add 1.5 hours (90 minutes)

    const punctualityStatus: PunctualityStatus =
      checkInTime >= lateThreshold
        ? PunctualityStatus.LATE
        : PunctualityStatus.ON_TIME;

    await prisma.attendanceLog.create({
      data: {
        employeeId: employee.id,
        checkInTime: checkInTime,
        status: "checked_in",
        checkInMethod: workMode,
        checkInLocation:
          workMode === "IN_OFFICE" && coords
            ? `${coords.lat}, ${coords.lng}`
            : null,
        punctualityStatus: punctualityStatus,
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

   
const { start, end } = getTodayRange("Africa/Lagos");

    const checkInRecord = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: employee.id,
        checkInTime: { gte: start, lt: end },
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
    
const { start, end } = getTodayRange("Africa/Lagos");

    const attendance = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: employee.id,
        checkInTime: { gte: start, lt: end },
        status: "checked_in",
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
