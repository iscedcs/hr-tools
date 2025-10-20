"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { updateEmployee } from "@/actions/employee-actions";
import { toast } from "sonner";

interface EditEmployeeDialogProps {
  employee: {
    id: string;
    employeeCode: string;
    role: string;
    position: string | null;
    phoneNumber: string | null;
    nfcCardId: string | null;
    isActive: boolean;
    departmentId: string | null;
    user: {
      name: string | null;
      email: string;
    };
  };
  departments: { id: string; name: string }[];
}

export function EditEmployeeDialog({
  employee,
  departments,
}: EditEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateEmployee(employee.id, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Employee updated successfully");
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={employee.user.name ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Read-only)</Label>
              <Input id="email" defaultValue={employee.user.email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code (Read-only)</Label>
              <Input
                id="employeeCode"
                defaultValue={employee.employeeCode}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select name="role" defaultValue={employee.role} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr_admin">HR Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                name="departmentId"
                defaultValue={employee.departmentId || "none"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                defaultValue={employee.position || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                defaultValue={employee.phoneNumber || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nfcCardId">NFC Card ID</Label>
              <Input
                id="nfcCardId"
                name="nfcCardId"
                defaultValue={employee.nfcCardId || ""}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={employee.isActive}
              value="true"
            />
            <Label htmlFor="isActive">Active Employee</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
