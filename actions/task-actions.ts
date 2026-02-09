"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { getTodayRange } from "@/lib/utils/getTodayRange";
import { getDayRange } from "@/lib/utils/getDayRange";
import {
  fetchMonotrakTasks,
  fetchMonotrakUsers,
  filterTasksForDate,
  type MonotrakTask,
} from "@/lib/monotrak-client";

type TasksByEmployee = Record<string, MonotrakTask[]>;

async function getTasksForEmployees(
  employees: Array<{
    employeeId: string;
    email: string | null | undefined;
  }>,
  dateRangesByEmployeeId?: Record<string, { start: Date; end: Date }>
) {
  const { users, integrationStatus, error: usersError } =
    await fetchMonotrakUsers();

  if (!integrationStatus.enabled || usersError) {
    return {
      tasksByEmployeeId: {} as TasksByEmployee,
      integrationStatus: usersError
        ? { enabled: false, reason: usersError }
        : integrationStatus,
    };
  }

  const emailToUserId = new Map(
    users
      .filter((user) => Boolean(user.email))
      .map((user) => [user.email!.toLowerCase(), user.id])
  );

  const taskResults = await Promise.all(
    employees.map(async (employee) => {
      const email = employee.email?.toLowerCase();
      const assignedTo = email ? emailToUserId.get(email) : undefined;

      if (!assignedTo) {
        return {
          employeeId: employee.employeeId,
          tasks: [] as MonotrakTask[],
        };
      }

      const { tasks } = await fetchMonotrakTasks({ assignedTo });
      const range = dateRangesByEmployeeId?.[employee.employeeId];
      const filtered = range
        ? filterTasksForDate(tasks, range.start, range.end)
        : tasks;

      return {
        employeeId: employee.employeeId,
        tasks: filtered,
      };
    })
  );

  const tasksByEmployeeId: TasksByEmployee = {};
  for (const result of taskResults) {
    tasksByEmployeeId[result.employeeId] = result.tasks;
  }

  return { tasksByEmployeeId, integrationStatus };
}

export async function getTodayAttendanceWithTasks() {
  await requireRole(["superadmin", "hr_admin"]);

  const { start, end } = getTodayRange("Africa/Lagos");
  const attendance = await prisma.attendanceLog.findMany({
    where: {
      checkInTime: { gte: start, lt: end },
    },
    include: {
      employee: {
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true } },
          employeeCode: true,
        },
      },
    },
    orderBy: { checkInTime: "desc" },
    take: 20,
  });

  const employees = Array.from(
    new Map(
      attendance.map((record) => [
        record.employeeId,
        {
          employeeId: record.employeeId,
          email: record.employee.user.email,
        },
      ])
    ).values()
  );

  const dateRangesByEmployeeId: Record<string, { start: Date; end: Date }> = {};
  for (const employee of employees) {
    dateRangesByEmployeeId[employee.employeeId] = { start, end };
  }

  const { tasksByEmployeeId, integrationStatus } = await getTasksForEmployees(
    employees,
    dateRangesByEmployeeId
  );

  return { attendance, tasksByEmployeeId, integrationStatus };
}

export async function getAttendanceLogsWithTasks(limit = 100) {
  await requireRole(["superadmin", "hr_admin"]);

  const logs = await prisma.attendanceLog.findMany({
    include: {
      employee: {
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true } },
          employeeCode: true,
        },
      },
    },
    orderBy: { checkInTime: "desc" },
    take: limit,
  });

  const employees = Array.from(
    new Map(
      logs.map((log) => [
        log.employeeId,
        {
          employeeId: log.employeeId,
          email: log.employee.user.email,
        },
      ])
    ).values()
  );

  const { tasksByEmployeeId, integrationStatus } = await getTasksForEmployees(
    employees
  );

  const tasksByLogId: TasksByEmployee = {};
  for (const log of logs) {
    const range = getDayRange(log.checkInTime, "Africa/Lagos");
    const tasksForEmployee = tasksByEmployeeId[log.employeeId] || [];
    tasksByLogId[log.id] = filterTasksForDate(
      tasksForEmployee,
      range.start,
      range.end
    );
  }

  return { logs, tasksByLogId, integrationStatus };
}
