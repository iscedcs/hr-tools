// actions/upload-employee-docs.ts
"use server";

import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { uploadFile } from "@/lib/spaces";

export async function uploadEmployeeDocument(
  type: "cv" | "acceptance_letter" | "nda" | "hand_book" | "profile_picture",
  file: File
) {
  const session = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });

  if (!employee) {
    return { error: "Employee not found" };
  }

  // Basic validation
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File must be under 10MB" };
  }

  const folder = `${process.env.DO_SPACES_DOCS_PREFIX}/${employee.id}`;

  const uploadResult = await uploadFile(file, folder);

  if (!uploadResult.success || !uploadResult.url) {
    return { error: "Failed to upload document" };
  }

  await prisma.employeeDocument.upsert({
    where: {
      employeeId_type: {
        employeeId: employee.id,
        type,
      },
    },
    update: {
      fileUrl: uploadResult.url,
      fileName: file.name,
    },
    create: {
      employeeId: employee.id,
      type,
      fileUrl: uploadResult.url,
      fileName: file.name,
    },
  });

  return { success: true, fileUrl: uploadResult.url };
}
