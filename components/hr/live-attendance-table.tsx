import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTodayAttendanceWithTasks } from "@/actions/task-actions";
import { formatInTimeZone } from "date-fns-tz";

export async function LiveAttendanceTable() {
  const timeZone = "Africa/Lagos";

  const { attendance, tasksByEmployeeId, integrationStatus } =
    await getTodayAttendanceWithTasks();

  const integrationMessage = integrationStatus.enabled
    ? null
    : integrationStatus.reason || "MonoTrak not connected";

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
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Tasks
                </th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => {
                const tasks = tasksByEmployeeId[record.employeeId] || [];
                return (
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
                    <Badge variant="outline">
                      {record.checkInMethod === "IN_OFFICE"
                        ? "In Office"
                        : record.checkInMethod === "REMOTE"
                        ? "Remote"
                        : record.checkInMethod || "-"}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-sm">
                    {record.punctualityStatus ? (
                      <Badge
                        variant={
                          record.punctualityStatus === "ON_TIME"
                            ? "default"
                            : "destructive"
                        }>
                        {record.punctualityStatus === "ON_TIME"
                          ? "On Time"
                          : "Late"}
                      </Badge>
                    ) : (
                      "-"
                    )}
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

                  <td className="py-3 px-4 text-sm">
                    {!integrationStatus.enabled ? (
                      <span className="text-xs text-muted-foreground">
                        {integrationMessage}
                      </span>
                    ) : tasks.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None</span>
                    ) : (
                      <div className="space-y-1">
                        {tasks.slice(0, 3).map((task, index) => (
                          <div
                            key={task.id || `${record.id}-task-${index}`}
                            className="flex flex-wrap items-center gap-2">
                            <span className="max-w-[200px] truncate">
                              {task.title}
                            </span>
                            {task.status ? (
                              <Badge variant="secondary">{task.status}</Badge>
                            ) : null}
                          </div>
                        ))}
                        {tasks.length > 3 ? (
                          <span className="text-xs text-muted-foreground">
                            +{tasks.length - 3} more
                          </span>
                        ) : null}
                      </div>
                    )}
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
