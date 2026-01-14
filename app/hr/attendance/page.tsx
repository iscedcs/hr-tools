import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AttendanceLogsPage() {
  const logs = await prisma.attendanceLog.findMany({
    include: {
      employee: {
        include: {
          user: { select: { name: true } },
          department: { select: { name: true } },
          employeeCode: true,
        },
      },
    },
    orderBy: { checkInTime: "desc" },
    take: 100,
  });

  const timeZone = "Africa/lagos";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Attendance Logs</h2>
        <p className="text-muted-foreground">
          View all employee check-in and check-out records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Check In
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Check Out
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Punctuality
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Hours
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">
                      {formatInTimeZone(
                        new Date(log.checkInTime),
                        timeZone,
                        "MMM d, yyyy"
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {log.employee.user.name}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {log.employee.employeeCode?.code}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {log.employee.department?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {formatInTimeZone(
                        new Date(log.checkInTime),
                        timeZone,
                        "HH:mm:ss"
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {log.checkOutTime
                        ? formatInTimeZone(
                            new Date(log.checkOutTime),
                            timeZone,
                            "HH:mm:ss"
                          )
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Badge variant="outline">
                        {log.checkInMethod === "IN_OFFICE"
                          ? "In Office"
                          : log.checkInMethod === "REMOTE"
                          ? "Remote"
                          : log.checkInMethod || "-"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {log.punctualityStatus ? (
                        <Badge
                          variant={
                            log.punctualityStatus === "ON_TIME"
                              ? "default"
                              : "destructive"
                          }>
                          {log.punctualityStatus === "ON_TIME"
                            ? "On Time"
                            : "Late"}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {log.totalHours ? `${log.totalHours}h` : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Badge
                        variant={
                          log.status === "checked_in" ? "default" : "secondary"
                        }>
                        {log.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
