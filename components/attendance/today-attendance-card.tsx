import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayAttendance } from "@/actions/attendance-actions";
import { Calendar, Clock } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

interface TodayAttendanceCardProps {
  userId: string;
}

export async function TodayAttendanceCard({
  userId,
}: TodayAttendanceCardProps) {
  const result = await getTodayAttendance(userId);
  const attendance = result.data;

  const timeZone = "Africa/lagos";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendance ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold capitalize">
                  {attendance.status.replace("_", " ")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Check-in</p>
                <p className="text-lg font-semibold">
                  {attendance.checkInTime
                    ? formatInTimeZone(
                        new Date(attendance.checkInTime),
                        timeZone,
                        "HH:mm:ss"
                      )
                    : "—"}{" "}
                </p>
              </div>
            </div>
            {attendance.checkOutTime && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="text-lg font-semibold">
                    {formatInTimeZone(
                      new Date(attendance.checkOutTime),
                      timeZone,
                      "HH:mm"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-lg font-semibold">
                    {attendance.totalHours?.toString()}h
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No attendance record for today</p>
            <p className="text-sm mt-1">Check in to start tracking your time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
