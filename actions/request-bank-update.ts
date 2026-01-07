"use server";

import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";

export async function requestBankUpdate() {
  const session = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });

  if (!employee) return { error: "Employee not found" };

  await prisma.employeeBankDetail.update({
    where: { employeeId: employee.id },
    data: {
      status: "PENDING_APPROVAL",
      requestedAt: new Date(),
    },
  });

  return { success: true };
}
