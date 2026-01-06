import { requireAuth } from "@/lib/auth-utils";
import { CheckInOutCard } from "@/components/attendance/check-in-out-card";
import { TodayAttendanceCard } from "@/components/attendance/today-attendance-card";
import { RecentAttendanceList } from "@/components/attendance/recent-attendance-list";
import { AttendanceStats } from "@/components/attendance/attendance-stats";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import prisma from "@/lib/db";
import { EmployeeLeaveSection } from "@/components/dashboard/employee-leave-section";
import { EmployeeProfileCard } from "@/components/dashboard/employee-profile-card";
import { EmployeeDocumentsCard } from "@/components/dashboard/employee-documents-card";
import { EmployeeBankDetailsCard } from "@/components/dashboard/employee-bank-details-card";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { calculateProfileCompletion } from "@/lib/calculate-profile-completion";

export default async function DashboardPage() {
  const session = await requireAuth();

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
    include: {
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      employeeDocuments: true,
    },
  });

  const documents = employee?.employeeDocuments ?? [];

  const cvUrl = documents.find((doc) => doc.type === "cv")?.fileUrl ?? null;

  const acceptanceLetterUrl =
    documents.find((doc) => doc.type === "acceptance_letter")?.fileUrl ?? null;

  const profileImageUrl =
    documents.find((d) => d.type === "profile_picture")?.fileUrl ?? null;

  const bankDetails = await prisma.employeeBankDetail.findUnique({
    where: { employeeId: employee?.id! },
  });

  const profileStats = calculateProfileCompletion({
    hasCv: documents.some((d) => d.type === "cv"),
    hasAcceptanceLetter: documents.some((d) => d.type === "acceptance_letter"),
    hasProfilePicture: documents.some((d) => d.type === "profile_picture"),
    hasBankDetails: !!bankDetails,
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />

      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {session.user.position || "Employee"} •{" "}
            {session.user.employeeCode ?? "No code"}
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <CheckInOutCard userId={session.user.id} />
            <TodayAttendanceCard userId={session.user.id} />
            <EmployeeLeaveSection
              employeeId={employee?.id || ""}
              leaveRequests={employee?.leaveRequests || []}
            />
            <RecentAttendanceList userId={session.user.id} />
          </div>

          <EmployeeProfileCard
            name={session.user.name!}
            email={session.user.email!}
            position={session.user.position}
            profileImageUrl={profileImageUrl}
          />

          <EmployeeDocumentsCard
            cvUrl={cvUrl}
            acceptanceLetterUrl={acceptanceLetterUrl}
          />

          <EmployeeBankDetailsCard
            defaultValues={{
              bankName: bankDetails?.bankName,
              accountName: bankDetails?.accountName,
              accountNumber: bankDetails?.accountNumber,
            }}
          />

          <ProfileCompletionCard
            percentage={profileStats.percentage}
            missingItems={profileStats.missing}
          />

          <div className="space-y-4 md:space-y-6">
            <AttendanceStats userId={session.user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
