"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  employeeId: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  status: string;
  checkInMethod: string;
  createdAt: Date;
  employee: {
    user: {
      name: string | null;
      email: string;
    };
  };
}

export function AuditLogsTable({ logs }: { logs: AuditLog[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground">
              No audit logs found
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {log.employee.user.name || "Unknown"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {log.employee.user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {log.checkOutTime ? "Checked Out" : "Checked In"}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{log.checkInMethod}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    log.status === "checked_in" ? "default" : "secondary"
                  }>
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(log.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
