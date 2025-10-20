"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { assignEmployeeCode } from "@/actions/employee-code-actions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AssignCodeDialog({
  codeId,
  code,
}: {
  codeId: string;
  code: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    if (open) {
      // Fetch employees without codes
      fetch("/api/employees/without-codes")
        .then((res) => res.json())
        .then((data) => setEmployees(data.employees || []))
        .catch((err) => console.error("Error fetching employees:", err));
    }
  }, [open]);

  const handleAssign = async () => {
    if (!selectedEmployeeId) {
      toast.error("Please select an employee");
      return;
    }

    setIsLoading(true);
    const result = await assignEmployeeCode({
      codeId,
      employeeId: selectedEmployeeId,
    });

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      setSelectedEmployeeId("");
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-1" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Employee Code</DialogTitle>
          <DialogDescription>
            Assign code {code} to an employee
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Select Employee</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.user.name} ({emp.user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading ? "Assigning..." : "Assign Code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
