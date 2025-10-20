"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";

// ------------------
// SYSTEM STATS
// ------------------

export async function getSystemStats() {
  await requireRole(["superadmin"]);

  try {
    const [
      totalUsers,
      activeUsers,
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalAttendanceLogs,
      pendingLeaves,
      todayAttendance,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.employee.count(),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.department.count(),
      prisma.attendanceLog.count(),
      prisma.leaveRequest.count({ where: { status: "pending" } }),
      prisma.attendanceLog.count({
        where: {
          checkInTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalEmployees,
        activeEmployees,
        totalDepartments,
        totalAttendanceLogs,
        pendingLeaves,
        todayAttendance,
      },
    };
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return { success: false, error: "Failed to fetch system statistics" };
  }
}

// ------------------
// USER MANAGEMENT
// ------------------

export async function getAllUsers() {
  await requireRole(["superadmin"]);

  try {
    const users = await prisma.user.findMany({
      include: {
        employee: {
          include: {
            department: true,
            employeeCode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: users ?? [] };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateUserRole(userId: string, role: string) {
  await requireRole(["superadmin"]);

  try {
    const employee = await prisma.employee.update({
      where: { userId },
      data: { role: role as UserRole },
      include: {
        user: true,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, data: employee };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function deactivateUser(userId: string) {
  await requireRole(["superadmin"]);

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Error deactivating user:", error);
    return { success: false, error: "Failed to deactivate user" };
  }
}

export async function reactivateUser(userId: string) {
  await requireRole(["superadmin"]);

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });

    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Error reactivating user:", error);
    return { success: false, error: "Failed to reactivate user" };
  }
}

// ------------------
// AUDIT LOGS (using Attendance Logs as proxy)
// ------------------

export async function getAuditLogs(limit = 100) {
  await requireRole(["superadmin"]);

  try {
    const logs = await prisma.attendanceLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return { success: false, error: "Failed to fetch audit logs" };
  }
}

// ------------------
// SYSTEM HEALTH
// ------------------
export async function createSystemSetting(
  settingKey: string,
  settingValue: string,
  description?: string
) {
  await requireRole(["superadmin"]);

  try {
    const setting = await prisma.systemSetting.create({
      data: {
        settingKey,
        settingValue,
        description,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true, data: setting };
  } catch (error) {
    console.error("Error creating system setting:", error);
    return { success: false, error: "Failed to create system setting" };
  }
}

export async function getSystemSettings() {
  await requireRole(["superadmin"]);

  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { settingKey: "asc" },
    });

    return { success: true, data: settings };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return { success: false, error: "Failed to fetch system settings" };
  }
}

export async function updateSystemSetting(
  id: string,
  settingValue: string,
  description?: string
) {
  await requireRole(["superadmin"]);

  try {
    const setting = await prisma.systemSetting.update({
      where: { id },
      data: {
        settingValue,
        description,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true, data: setting };
  } catch (error) {
    console.error("Error updating system setting:", error);
    return { success: false, error: "Failed to update system setting" };
  }
}

export async function getSystemHealth() {
  await requireRole(["superadmin"]);

  try {
    const [userCount, employeeCount, attendanceCount, leaveCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.employee.count(),
        prisma.attendanceLog.count(),
        prisma.leaveRequest.count(),
      ]);

    return {
      success: true,
      data: {
        database: {
          status: "healthy", // if Prisma queries succeeded
          size: "Unavailable via Prisma ORM", // only available via raw SQL
          tables: {
            users: userCount,
            employees: employeeCount,
            attendance: attendanceCount,
            leaves: leaveCount,
          },
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    };
  } catch (error) {
    console.error("Error checking system health:", error);
    return { success: false, error: "Failed to check system health" };
  }
}

export async function deleteSystemSetting(id: string) {
  await requireRole(["superadmin"]);

  try {
    await prisma.systemSetting.delete({
      where: { id },
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting system setting:", error);
    return { success: false, error: "Failed to delete system setting" };
  }
}
