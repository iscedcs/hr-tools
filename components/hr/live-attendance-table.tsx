import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { formatInTimeZone } from "date-fns-tz";

export async function LiveAttendanceTable() {
  const timeZone = "Africa/Lagos";

  // Use UTC day range for consistent querying
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendanceLog.findMany({
    where: {
      checkInTime: { gte: today },
    },
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
    take: 20,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
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
                  Hours
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="border-b border-border">
                  <td className="py-3 px-4 text-sm">
                    {record.employee.user.name}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {record.employee.employeeCode?.code}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {record.employee.department?.name || "N/A"}
                  </td>

                  {/* ✅ Correctly formatted Lagos local time */}
                  <td className="py-3 px-4 text-sm">
                    {formatInTimeZone(record.checkInTime, timeZone, "HH:mm")}
                  </td>

                  <td className="py-3 px-4 text-sm">
                    {record.checkOutTime
                      ? formatInTimeZone(record.checkOutTime, timeZone, "HH:mm")
                      : "-"}
                  </td>

                  <td className="py-3 px-4 text-sm">
                    {record.totalHours ? `${record.totalHours}h` : "-"}
                  </td>

                  <td className="py-3 px-4 text-sm">
                    <Badge
                      variant={
                        record.status === "checked_in" ? "default" : "secondary"
                      }>
                      {record.status.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
