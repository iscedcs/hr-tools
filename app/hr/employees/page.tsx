import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import { EditEmployeeDialog } from "@/components/hr/edit-employee-dialog";

export default async function EmployeesPage() {
  const [employees, department] = await Promise.all([
    prisma.employee.findMany({
      select: {
        id: true,
        role: true,
        position: true,
        phoneNumber: true,
        nfcCardId: true,
        isActive: true,
        departmentId: true,
        user: { select: { name: true, email: true } },
        department: { select: { name: true } },
        employeeCode: {
          select: { code: true },
        },
      },
      orderBy: { user: { name: "asc" } },
    }),

    prisma.department.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const employeeForClient = employees.map((e) => ({
    id: e.id,
    role: e.role,
    position: e.position,
    phoneNumber: e.phoneNumber,
    nfcCardId: e.nfcCardId,
    isActive: e.isActive,
    departmentId: e.departmentId,
    user: e.user,
    department: e.department,
    // convert nested employeeCode to a plain string (or choose a placeholder)
    employeeCode: e.employeeCode?.code ?? "",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Employees</h2>
          <p className="text-muted-foreground">
            Manage employee records and access
          </p>
        </div>
        <Button asChild>
          <Link href="/hr/employees/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees ({employeeForClient.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Position
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employeeForClient.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm font-medium">
                      {employee.user.name}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {employee.employeeCode}
                    </td>
                    <td className="py-3 px-4 text-sm">{employee.user.email}</td>
                    <td className="py-3 px-4 text-sm">
                      {employee.department?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {employee.position || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Badge variant="outline" className="capitalize">
                        {employee.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Badge
                        variant={employee.isActive ? "default" : "secondary"}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/hr/employees/${employee.id}`}>View</Link>
                      </Button>

                      <EditEmployeeDialog
                        employee={employee}
                        departments={department}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
