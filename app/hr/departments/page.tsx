import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { EditDepartmentDialog } from "@/components/hr/edit-department-dialog";

export default async function DepartmentsPage() {
  const [departments, employees] = await Promise.all([
    prisma.department.findMany({
      include: {
        manager: {
          include: {
            user: { select: { name: true } },
          },
        },
        _count: {
          select: {
            employees: {
              where: {
                isActive: true,
                user: { name: { not: null } },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),

    prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        employeeCode: {
          select: {
            code: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  const employeeForClient = employees.map((e) => ({
    id: e.id,
    user: e.user,
    employeeCode: e.employeeCode?.code ?? "",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Departments</h2>
          <p className="text-muted-foreground">
            Manage organizational departments
          </p>
        </div>
        <Button asChild>
          <Link href="/hr/departments/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{dept.name}</span>
                <Users className="h-5 w-5 text-muted-foreground" />
                <EditDepartmentDialog
                  department={dept}
                  employees={employeeForClient}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {dept.description || "No description"}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Manager:</span>
                <span className="font-medium">
                  {dept.manager?.user.name || "Not assigned"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Employees:</span>
                <span className="font-medium">{dept._count.employees}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
