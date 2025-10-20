import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentAttendance } from "@/actions/attendance-actions";
import { History } from "lucide-react";
import { format } from "date-fns";

interface RecentAttendanceListProps {
  userId: string;
}

export async function RecentAttendanceList({
  userId,
}: RecentAttendanceListProps) {
  const result = await getRecentAttendance(userId, 7);
  const attendance = result.data || [];

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
                    ? format(new Date(record.checkInTime), "EEEE, MMM d")
                    : "Invalid date"}
                  <p className="text-sm text-muted-foreground">
                    {record.checkInTime &&
                      format(new Date(record.checkInTime), "HH:mm")}
                    {record.checkOutTime &&
                      ` - ${format(new Date(record.checkOutTime), "HH:mm")}`}
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
