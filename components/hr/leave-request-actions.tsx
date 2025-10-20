"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import {
  approveLeaveRequest,
  rejectLeaveRequest,
} from "@/actions/leave-actions";
import { toast } from "sonner";

interface LeaveRequestActionsProps {
  requestId: string;
  status: string;
}

export function LeaveRequestActions({
  requestId,
  status,
}: LeaveRequestActionsProps) {
  const [loading, setLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const router = useRouter();

  async function handleApprove() {
    setLoading(true);
    const result = await approveLeaveRequest(requestId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Leave request approved");
      router.refresh();
    }

    setLoading(false);
  }

  async function handleReject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const reason = formData.get("reason") as string;

    const result = await rejectLeaveRequest(requestId, reason);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Leave request rejected");
      setRejectDialogOpen(false);
      router.refresh();
    }

    setLoading(false);
  }

  if (status !== "pending") {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="default"
        onClick={handleApprove}
        disabled={loading}>
        <Check className="h-4 w-4 mr-1" />
        Approve
      </Button>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="destructive" disabled={loading}>
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                name="reason"
                required
                rows={4}
                placeholder="Please provide a reason for rejection..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? "Rejecting..." : "Reject Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
