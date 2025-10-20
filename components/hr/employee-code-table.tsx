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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, UserMinus, Search } from "lucide-react";
import { AssignCodeDialog } from "./assign-code-dialog";
import {
  deleteEmployeeCode,
  unassignEmployeeCode,
  bulkDeleteUnassignedCodes,
} from "@/actions/employee-code-actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type EmployeeCode = {
  id: string;
  code: string;
  assigned: boolean;
  assignedAt: Date | null;
  createdAt: Date;
  Employee: {
    user: {
      name: string | null;
      email: string;
    };
  } | null;
};

export function EmployeeCodesTable({ codes }: { codes: EmployeeCode[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "assigned" | "unassigned"
  >("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  const filteredCodes = codes.filter((code) => {
    const matchesSearch =
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.Employee?.user.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      code.Employee?.user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "assigned" && code.assigned) ||
      (filterStatus === "unassigned" && !code.assigned);

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (!selectedCodeId) return;

    const result = await deleteEmployeeCode(selectedCodeId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
    setDeleteDialogOpen(false);
    setSelectedCodeId(null);
  };

  const handleUnassign = async (codeId: string) => {
    const result = await unassignEmployeeCode(codeId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  };

  const handleBulkDelete = async () => {
    const result = await bulkDeleteUnassignedCodes();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
    setBulkDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Codes</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setBulkDeleteDialogOpen(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Unassigned
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCodes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground">
                  No employee codes found
                </TableCell>
              </TableRow>
            ) : (
              filteredCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-semibold">
                    {code.code}
                  </TableCell>
                  <TableCell>
                    {code.assigned ? (
                      <Badge variant="default" className="bg-green-600">
                        Assigned
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {code.Employee ? (
                      <div>
                        <p className="font-medium">{code.Employee.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {code.Employee.user.email}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {code.assignedAt
                      ? new Date(code.assignedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(code.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {code.assigned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassign(code.id)}>
                          <UserMinus className="h-4 w-4 mr-1" />
                          Unassign
                        </Button>
                      ) : (
                        <AssignCodeDialog codeId={code.id} code={code.code} />
                      )}
                      {!code.assigned && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCodeId(code.id);
                            setDeleteDialogOpen(true);
                          }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employee code? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Unassigned Codes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all unassigned employee codes?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
