"use server";

import prisma from "@/lib/db";

export async function validateEmployeeCode(code: string) {
  if (!code) return false;

  const record = await prisma.employeeCode.findUnique({
    where: { code },
    include: {
      Employee: true,
    },
  });

  // Return true only if the code exists and is not assigned
  return !!record && !record.Employee;
}
