"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export async function LateArrivalsReport() {
  // Get work start time from settings (default 09:00)
  const workStartSetting = await prisma.systemSetting.findUnique({
    where: { settingKey: "work_hours_start" },
  });
  const workStartTime = workStartSetting?.settingValue || "09:00";

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const lateArrivals = await prisma.$queryRaw<
    Array<{
      id: number;
      check_in_time: Date;
      employee_name: string;
      employee_code: string;
      department_name: string | null;
      minutes_late: number;
    }>
  >`
    SELECT 
      a.id,
      a.check_in_time,
      u.name as employee_name,
      e.employee_code,
      d.name as department_name,
      EXTRACT(EPOCH FROM (a.check_in_time::time - ${workStartTime}::time))/60 as minutes_late
    FROM attendance_logs a
    JOIN employees e ON a.employee_id = e.id
    JOIN neon_auth.users_sync u ON e.user_id = u.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE a.check_in_time >= ${startOfMonth}
    AND a.check_in_time::time > ${workStartTime}::time
    ORDER BY a.check_in_time DESC
    LIMIT 100
  `;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Late Arrivals (This Month)</CardTitle>
      </CardHeader>
      <CardContent>
        {lateArrivals.length > 0 ? (
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
                    Check-in Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Minutes Late
                  </th>
                </tr>
              </thead>
              <tbody>
                {lateArrivals.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">
                      {format(new Date(record.check_in_time), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {record.employee_name}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {record.employee_code}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {record.department_name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {format(new Date(record.check_in_time), "HH:mm:ss")}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Badge variant="destructive">
                        {Math.round(record.minutes_late)} min
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No late arrivals recorded this month</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
