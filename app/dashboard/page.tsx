import { requireAuth } from "@/lib/auth-utils";
import { CheckInOutCard } from "@/components/attendance/check-in-out-card";
import { TodayAttendanceCard } from "@/components/attendance/today-attendance-card";
import { RecentAttendanceList } from "@/components/attendance/recent-attendance-list";
import { AttendanceStats } from "@/components/attendance/attendance-stats";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import prisma from "@/lib/db";
import { EmployeeLeaveSection } from "@/components/dashboard/employee-leave-section";

export default async function DashboardPage() {
  const session = await requireAuth();

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
    include: {
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />

      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {session.user.position || "Employee"} •{" "}
            {session.user.employeeCode ?? "No code"}
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <CheckInOutCard userId={session.user.id} />
            <TodayAttendanceCard userId={session.user.id} />
            <EmployeeLeaveSection
              employeeId={employee?.id || ""}
              leaveRequests={employee?.leaveRequests || []}
            />
            <RecentAttendanceList userId={session.user.id} />
          </div>
          <div className="space-y-4 md:space-y-6">
            <AttendanceStats userId={session.user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
