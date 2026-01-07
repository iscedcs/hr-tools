"use server";

import { requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function approveBankUpdate(formData: FormData): Promise<void> {
  await requireRole(["superadmin", "hr_admin"]);

  const employeeId = formData.get("employeeId") as string;

  await prisma.employeeBankDetail.update({
    where: { employeeId },
    data: {
      status: "EDITABLE",
      approvedAt: new Date(),
    },
  });

  revalidatePath(`/hr/employees/${employeeId}`);
}

export async function rejectBankUpdate(formData: FormData): Promise<void> {
  await requireRole(["superadmin", "hr_admin"]);

  const employeeId = formData.get("employeeId") as string;
  const reason = formData.get("reason") as string;
  await prisma.employeeBankDetail.update({
    where: { employeeId },
    data: {
      status: "LOCKED",
      rejectedAt: new Date(),
      rejectionReason: reason,
    },
  });

  revalidatePath(`/hr/employees/${employeeId}`);
}
