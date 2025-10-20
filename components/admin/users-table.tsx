"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, UserX, UserCheck, Loader2 } from "lucide-react";
import { deactivateUser, reactivateUser } from "@/actions/admin-actions";
import { toast } from "sonner";
import { EditUserRoleDialog } from "./edit-users-role-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export function UsersTable({ users }: { users: User[] }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeactivate = async (userId: string) => {
    setIsLoading(true);
    try {
      const result = await deactivateUser(userId);
      if (result.success) {
        toast.success("User deactivated successfully");
      } else {
        toast.error(result.error || "Failed to deactivate user");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleReactivate = async (userId: string) => {
    setIsLoading(true);
    try {
      const result = await reactivateUser(userId);
      if (result.success) {
        toast.success("User reactivated successfully");
      } else {
        toast.error(result.error || "Failed to reactivate user");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Employee Code</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name!}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="font-mono text-sm">
                {user.employee?.employeeCode?.code!}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.employee?.role === "superadmin"
                      ? "default"
                      : user.employee?.role === "hr_admin"
                      ? "secondary"
                      : "outline"
                  }>
                  {user.employee?.role || "employee"}
                </Badge>
              </TableCell>
              <TableCell>{user.employee?.department?.name!}</TableCell>
              <TableCell>
                <Badge variant={user.deletedAt ? "destructive" : "default"}>
                  {user.deletedAt ? "Inactive" : "Active"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditOpen(true);
                    }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {user.deletedAt ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleReactivate(user.id)}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-green-500" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => {
                        setTargetUserId(user.id);
                        setConfirmOpen(true);
                      }}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                      ) : (
                        <UserX className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUser && (
        <EditUserRoleDialog
          user={selectedUser}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive">
              Are you sure you want to deactivate this user? Their account will
              be temporarily disabled but can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              className="bg-destructive"
              onClick={() => targetUserId && handleDeactivate(targetUserId)}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Deactivate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
