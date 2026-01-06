"use server";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";

export async function saveBankDetails(
  prevState: any,
  data: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }
) {
  const session = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });

  if (!employee) return { error: "Employee not found" };

  await prisma.employeeBankDetail.upsert({
    where: { employeeId: employee.id },
    update: data,
    create: {
      employeeId: employee.id,
      ...data,
    },
  });

  return { success: true };
}
