import { requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmployeeForm } from "@/components/hr/employee-form";

export default async function NewEmployeePage() {
  await requireRole(["superadmin", "hr_admin"]);

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/hr/employees">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Employee</h1>
        <p className="text-muted-foreground mt-2">
          Create a new employee account with their details
        </p>
      </div>

      <EmployeeForm departments={departments} />
    </div>
  );
}
