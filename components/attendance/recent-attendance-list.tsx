import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentAttendance } from "@/actions/attendance-actions";
import { History } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

interface RecentAttendanceListProps {
  userId: string;
}

export async function RecentAttendanceList({
  userId,
}: RecentAttendanceListProps) {
  const result = await getRecentAttendance(userId, 7);
  const attendance = result.data || [];
  const timeZone = "Africa/lagos";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendance.length > 0 ? (
          <div className="space-y-3">
            {attendance.map((record: any) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="space-y-1">
                  {record.checkInTime
                    ? formatInTimeZone(
                        new Date(record.checkInTime),
                        timeZone,
                        "EEEE, MMM d"
                      )
                    : "Invalid date"}
                  <p className="text-sm text-muted-foreground">
                    {record.checkInTime &&
                      formatInTimeZone(
                        new Date(record.checkInTime),
                        timeZone,
                        "HH:mm"
                      )}
                    {record.checkOutTime &&
                      ` - ${formatInTimeZone(
                        new Date(record.checkOutTime),
                        timeZone,
                        "HH:mm"
                      )}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">
                    {record.status.replace("_", " ")}
                  </p>
                  {record.total_hours && (
                    <p className="text-sm text-muted-foreground">
                      {record.total_hours}h
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No attendance history yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
