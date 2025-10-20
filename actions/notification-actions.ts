"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getNotifications(userId: string, limit = 20) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return { data: [], error: null };
    }

    const notifications = await prisma.notification.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { data: notifications, error: null };
  } catch (error) {
    console.error(" Get notifications error:", error);
    return { data: null, error: "Failed to fetch notifications" };
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return { count: 0, error: null };
    }

    const count = await prisma.notification.count({
      where: {
        employeeId: employee.id,
        isRead: false,
      },
    });

    return { count, error: null };
  } catch (error) {
    console.error(" Get unread count error:", error);
    return { count: 0, error: "Failed to fetch unread count" };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await requireAuth();

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error) {
    console.error(" Mark as read error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await requireAuth();

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return { error: "Employee record not found" };
    }

    await prisma.notification.updateMany({
      where: {
        employeeId: employee.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error) {
    console.error(" Mark all as read error:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

export async function createNotification(
  employeeId: string,
  title: string,
  message: string,
  type: "reminder" | "alert" | "info"
) {
  try {
    await prisma.notification.create({
      data: {
        employeeId,
        title,
        message,
        type,
        isRead: false,
      },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error(" Create notification error:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

export async function sendCheckInReminder() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        attendanceLogs: {
          none: {
            checkInTime: { gte: today },
          },
        },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    for (const employee of employees) {
      await createNotification(
        employee.id,
        "Check-in Reminder",
        "Don't forget to check in for today!",
        "reminder"
      );
    }

    return { success: true, count: employees.length, error: null };
  } catch (error) {
    console.error(" Send check-in reminder error:", error);
    return { success: false, count: 0, error: "Failed to send reminders" };
  }
}

export async function sendCheckOutReminder() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        attendanceLogs: {
          some: {
            status: "checked_in",
            checkInTime: { gte: today },
          },
        },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    for (const employee of employees) {
      await createNotification(
        employee.id,
        "Check-out Reminder",
        "Remember to check out before leaving!",
        "reminder"
      );
    }

    return { success: true, count: employees.length, error: null };
  } catch (error) {
    console.error(" Send check-out reminder error:", error);
    return { success: false, count: 0, error: "Failed to send reminders" };
  }
}
