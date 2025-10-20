import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployeeCodes } from "@/actions/employee-code-actions";
import { EmployeeCodesTable } from "@/components/hr/employee-code-table";
import { GenerateCodesDialog } from "@/components/hr/generate-codes-dialog";

async function EmployeeCodesContent() {
  const result = await getEmployeeCodes();

  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Failed to load employee codes
          </p>
        </CardContent>
      </Card>
    );
  }

  const codes = result.data;
  const assignedCount = codes.filter((c) => c.assigned).length;
  const unassignedCount = codes.filter((c) => !c.assigned).length;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Codes</CardDescription>
            <CardTitle className="text-3xl">{codes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Assigned</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {assignedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Available</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {unassignedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Codes</CardTitle>
              <CardDescription>
                Manage employee identification codes
              </CardDescription>
            </div>
            <GenerateCodesDialog />
          </div>
        </CardHeader>
        <CardContent>
          <EmployeeCodesTable codes={codes} />
        </CardContent>
      </Card>
    </>
  );
}

export default function EmployeeCodesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Codes</h1>
        <p className="text-muted-foreground">
          Generate and manage employee identification codes
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        }>
        <EmployeeCodesContent />
      </Suspense>
    </div>
  );
}
