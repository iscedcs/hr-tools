"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  checkInAction,
  checkOutAction,
  getTodayAttendance,
} from "@/actions/attendance-actions";
import { Clock, Loader2, Building2, Home } from "lucide-react";
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
  const [showWorkModeDialog, setShowWorkModeDialog] = useState(false);

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

  const handleCheckInClick = () => {
    setShowWorkModeDialog(true);
  };

  const handleInOfficeClick = () => {
  if (!navigator.geolocation) {
    toast.error("Geolocation not supported");
    return;
  }

  setIsLoading(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      setShowWorkModeDialog(false);

      const result = await checkInAction("IN_OFFICE", {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      if (result.error) toast.error(result.error);
      else {
        toast.success(result.message);
        await loadTodayAttendance();
      }

      setIsLoading(false);
    },
   (error) => {
  if (error.code === error.PERMISSION_DENIED) {
    toast.error("Location access blocked. Please enable it in browser settings.");
  } else {
    toast.error("Unable to get your location");
  }
  setIsLoading(false);
},

    { enableHighAccuracy: true }
  );
};

  const handleCheckIn = async (workMode: "REMOTE") => {
  setShowWorkModeDialog(false);
  setIsLoading(true);

  try {
    const result = await checkInAction(workMode);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
      await loadTodayAttendance();
    }
  } catch {
    toast.error("Failed to check in");
  } finally {
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

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Method:</span>
              <Badge variant="outline">
                {todayAttendance.checkInMethod === "IN_OFFICE"
                  ? "In Office"
                  : todayAttendance.checkInMethod === "REMOTE"
                  ? "Remote"
                  : todayAttendance.checkInMethod || "—"}
              </Badge>
            </div>

            {todayAttendance.punctualityStatus && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  variant={
                    todayAttendance.punctualityStatus === "ON_TIME"
                      ? "default"
                      : "destructive"
                  }>
                  {todayAttendance.punctualityStatus === "ON_TIME"
                    ? "On Time"
                    : "Late"}
                </Badge>
              </div>
            )}

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
              onClick={handleCheckInClick}
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

      <Dialog open={showWorkModeDialog} onOpenChange={setShowWorkModeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Work Mode</DialogTitle>
            <DialogDescription>
              Choose how you&apos;re working today before checking in
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-start justify-start p-4 space-y-2"
              onClick={handleInOfficeClick}
              disabled={isLoading}>
              <div className="flex items-center gap-3 w-full">
                <Building2 className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">In Office</div>
                  <div className="text-sm text-muted-foreground">
                    Requires location verification
                  </div>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start justify-start p-4 space-y-2"
              onClick={() => handleCheckIn("REMOTE")}
              disabled={isLoading}>
              <div className="flex items-center gap-3 w-full">
                <Home className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Remote</div>
                  <div className="text-sm text-muted-foreground">
                    Working from a remote location
                  </div>
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWorkModeDialog(false)}
              disabled={isLoading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
