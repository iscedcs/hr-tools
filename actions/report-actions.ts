import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { eachDayOfInterval, parseISO } from "date-fns";

export async function generateAttendanceReport(
  startDate: string,
  endDate: string
) {
  try {
    await requireRole(["superadmin", "hr_admin"]);

    // Lateness cut-off time (used for late day counting in reports)
    const cutoffSetting = await prisma.systemSetting.findUnique({
      where: { settingKey: "attendance_cutoff_time" },
    });
    const workStartSetting = await prisma.systemSetting.findUnique({
      where: { settingKey: "work_hours_start" },
    });
    const cutoffTime =
      cutoffSetting?.settingValue ||
      workStartSetting?.settingValue ||
      "09:30";

    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        user: true,
        department: true,
        attendanceLogs: {
          where: {
            checkInTime: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        },
        employeeCode: true,
      },
    });

    const report = employees.map((emp) => {
      const logs = emp.attendanceLogs;

      const totalDays = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      }).length;

      const presentDays = new Set(
        logs.map((log) => log.checkInTime.toISOString().split("T")[0])
      ).size;

      const absentDays = totalDays - presentDays;

      const lateDays = logs.filter((log) => {
        const checkIn = log.checkInTime;
        const [hours, minutes] = cutoffTime.split(":").map(Number);
        const threshold = new Date(checkIn);
        threshold.setHours(hours, minutes, 0, 0);
        return checkIn > threshold;
      }).length;

      const totalHours = logs.reduce(
        (sum, log) => sum + (log.totalHours?.toNumber() || 0),
        0
      );
      const avgHours = logs.length > 0 ? totalHours / logs.length : 0;

      return {
        employee_code: emp.employeeCode?.code,
        employee_name: emp.user.name ?? "",
        department_name: emp.department?.name ?? null,
        total_days: BigInt(totalDays),
        present_days: BigInt(presentDays),
        absent_days: BigInt(absentDays),
        late_days: BigInt(lateDays),
        total_hours: Number(totalHours.toFixed(2)),
        avg_hours: Number(avgHours.toFixed(2)),
      };
    });

    return { data: report, error: null };
  } catch (error) {
    console.error("Generate report error:", error);
    return { data: null, error: "Failed to generate report" };
  }
}
