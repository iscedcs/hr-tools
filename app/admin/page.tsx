import { requireAuth, requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { AdminActivityChart } from "@/components/admin/admin-activity-chart";
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity";
import { AdminStatsCards } from "@/components/admin/admin-stats-card";
import { AdminQuickActions } from "@/components/admin/admin-quick-action";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function AdminDashboardPage() {
  const session = await requireAuth();

  const [
    totalEmployees,
    activeEmployees,
    totalDepartments,
    pendingLeaves,
    todayAttendance,
    recentActivities,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.department.count(),
    prisma.leaveRequest.count({ where: { status: "pending" } }),
    prisma.attendanceLog.count({
      where: {
        checkInTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.attendanceLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          include: { user: true },
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="sm:text-3xl text-xl font-bold text-foreground mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-md sm:text-lg">
            Complete system overview and management
          </p>
        </div>

        <AdminStatsCards
          totalEmployees={totalEmployees}
          activeEmployees={activeEmployees}
          totalDepartments={totalDepartments}
          pendingLeaves={pendingLeaves}
          todayAttendance={todayAttendance}
        />

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminActivityChart />
            <AdminRecentActivity activities={recentActivities} />
          </div>
          <div>{/* <AdminQuickActions /> */}</div>
        </div>
      </div>
    </div>
  );
}
