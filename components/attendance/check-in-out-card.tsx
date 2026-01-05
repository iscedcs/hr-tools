"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  checkInAction,
  checkOutAction,
  getTodayAttendance,
} from "@/actions/attendance-actions";
import { Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { AttendanceLog } from "@prisma/client";

interface CheckInOutCardProps {
  userId: string;
}

export function CheckInOutCard({ userId }: CheckInOutCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<AttendanceLog | null>(
    null
  );
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadTodayAttendance();
  }, [userId]);

  const loadTodayAttendance = async () => {
    const result = await getTodayAttendance(userId);
    if (result.data) {
      setTodayAttendance(result.data);
      setIsCheckedIn(result.data.status === "checked_in");
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      if (!navigator.geolocation) {
        toast.error("Geolocation not supported on this device");
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const result = await checkInAction({
            lat: latitude,
            lng: longitude,
          });

          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success(result.message);
            await loadTodayAttendance();
          }

          setIsLoading(false);
        },
        (error) => {
          console.error(error);
          toast.error("Location permission denied");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch {
      toast.error("Failed to check in");
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      const result = await checkOutAction();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        await loadTodayAttendance();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Check In / Check Out
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasMounted && (
          <>
            <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              {format(currentTime, "HH:mm:ss")}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(currentTime, "EEEE, MMMM d, yyyy")}
            </div>
          </>
        )}
        {todayAttendance && (
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Check-in Time:</span>
              <span className="font-medium">
                {todayAttendance.checkInTime
                  ? format(new Date(todayAttendance.checkInTime), "HH:mm:ss")
                  : "—"}
              </span>
            </div>

            {todayAttendance.checkOutTime && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Check-out Time:</span>
                  <span className="font-medium">
                    {format(new Date(todayAttendance.checkOutTime), "HH:mm:ss")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Hours:</span>
                  <span className="font-medium">
                    {todayAttendance.totalHours?.toString()} hours
                  </span>
                </div>
              </>
            )}
            {todayAttendance?.checkOutMethod === "auto" && (
              <p className="text-xs text-muted-foreground">
                Auto-checked out at 6 PM
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {!isCheckedIn ? (
            <Button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="flex-1"
              size="lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check In
            </Button>
          ) : (
            <Button
              onClick={handleCheckOut}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
              size="lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
