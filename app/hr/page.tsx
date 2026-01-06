import { LiveAttendanceTable } from "@/components/hr/live-attendance-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getTodayRange } from "@/lib/utils/getTodayRange";
import { Clock, ShieldCheck, UserCheck, Users, UserX } from "lucide-react";
export default async function HROverviewPage() {
  const { start, end } = getTodayRange("Africa/Lagos");

  const [totalEmployees, checkedIn, checkedOut, onLeave] = await Promise.all([
    prisma.employee.count({ where: { isActive: true } }),
    prisma.attendanceLog.findMany({
      where: {
        checkInTime: { gte: start, lt: end },
        status: "checked_in",
      },
      distinct: ["employeeId"],
    }),
    prisma.attendanceLog.findMany({
      where: {
        checkInTime: { gte: start, lt: end },
        status: "checked_out",
      },
      distinct: ["employeeId"],
    }),
    prisma.leaveRequest.count({
      where: {
        status: "approved",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    }),
  ]);

  const absent =
    totalEmployees - checkedIn.length - checkedOut.length - onLeave;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Overview</h2>
        <p className="text-muted-foreground">
          Real-time attendance monitoring and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active employees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leave Request</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onLeave}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requested leaves by employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedIn.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently at work
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedOut.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absent}</div>
            <p className="text-xs text-muted-foreground mt-1">Not checked in</p>
          </CardContent>
        </Card>
      </div>

      <LiveAttendanceTable />
    </div>
  );
}
