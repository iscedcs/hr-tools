"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus } from "lucide-react";
import { useState } from "react";
import { LeaveRequestDialog } from "./leave-request-dialog";
import { format } from "date-fns";
import type { LeaveRequest } from "@prisma/client";

interface EmployeeLeaveSectionProps {
  employeeId: string;
  leaveRequests: LeaveRequest[];
}

export function EmployeeLeaveSection({
  employeeId,
  leaveRequests,
}: EmployeeLeaveSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Requests
          </CardTitle>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No leave requests yet</p>
              <p className="text-sm mt-1">
                Click the button above to request leave
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{request.leaveType}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.startDate), "MMM dd")} -{" "}
                        {format(new Date(request.endDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.totalDays} days
                  </p>
                  {request.reason && (
                    <p className="text-sm mt-2">{request.reason}</p>
                  )}
                  {request.rejectionReason && (
                    <p className="text-sm text-destructive mt-2">
                      Reason: {request.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LeaveRequestDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        employeeId={employeeId}
      />
    </>
  );
}
