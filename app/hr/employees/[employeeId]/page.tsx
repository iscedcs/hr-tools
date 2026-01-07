import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  approveBankUpdate,
  rejectBankUpdate,
} from "@/actions/hr-bank-approval";

export const dynamic = "force-dynamic";

function maskAccountNumber(v?: string | null) {
  if (!v) return "—";
  return v.replace(/\d(?=\d{4})/g, "*");
}

export default async function EmployeeDetailsPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  await requireRole(["superadmin", "hr_admin"]);

  const { employeeId } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: true,
      department: true,
      employeeDocuments: true,
      employeeCode: true,
    },
  });

  if (!employee) return notFound();

  const bank = await prisma.employeeBankDetail.findUnique({
    where: { employeeId: employee.id },
  });

  const profilePicture = employee.employeeDocuments.find(
    (d) => d.type === "profile_picture"
  )?.fileUrl;

  const cv = employee.employeeDocuments.find((d) => d.type === "cv")?.fileUrl;
  const acceptanceLetter = employee.employeeDocuments.find(
    (d) => d.type === "acceptance_letter"
  )?.fileUrl;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/hr/employees">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Button>
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold">
            {employee.user?.name ?? "Employee"}
          </h1>

          <p className="text-sm text-muted-foreground">
            {employee.employeeCode?.code ?? "No code"} •{" "}
            {employee.department?.name ?? "No department"}
          </p>
        </div>

        <Badge variant={employee.isActive ? "default" : "secondary"}>
          {employee.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PROFILE */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={profilePicture ?? undefined}
                className="object-cover"
              />
              <AvatarFallback>
                {(employee.user?.name ?? "E")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <p className="font-medium">{employee.user?.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">
                {employee.user?.email ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {employee.position ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {employee.phoneNumber ?? "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* BANK */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank</span>
              <span className="font-medium">{bank?.bankName ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Name</span>
              <span className="font-medium">{bank?.accountName ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Number</span>
              <span className="font-medium">
                {maskAccountNumber(bank?.accountNumber)}
              </span>
            </div>

            {bank?.status === "PENDING_APPROVAL" && (
              <div className="mt-4 space-y-2">
                <Badge variant="outline">Pending Approval</Badge>

                <div className="flex gap-2">
                  <form action={approveBankUpdate}>
                    <input
                      type="hidden"
                      name="employeeId"
                      value={employee.id}
                    />
                    <Button size="sm">Approve</Button>
                  </form>

                  <form action={rejectBankUpdate}>
                    <input
                      type="hidden"
                      name="employeeId"
                      value={employee.id}
                    />
                    <input
                      type="hidden"
                      name="reason"
                      value="Incorrect details"
                    />
                    <Button size="sm" variant="destructive">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* DOCUMENTS */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocCard title="CV" url={cv} />
            <DocCard title="Acceptance Letter" url={acceptanceLetter} />
            <DocCard title="Profile Picture" url={profilePicture} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DocCard({ title, url }: { title: string; url?: string | null }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <p className="font-medium">{title}</p>
      {url ? (
        <a
          className="text-sm text-primary underline"
          href={url}
          target="_blank">
          View
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">Not uploaded</p>
      )}
    </div>
  );
}
