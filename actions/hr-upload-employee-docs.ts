"use server";

import { requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { uploadFile } from "@/lib/spaces";
import { revalidatePath } from "next/cache";

export async function uploadEmployeeDocumentByHR(
  employeeId: string,
  type: "cv" | "acceptance_letter" | "nda" | "hand_book",
  formData: FormData
) {
  try {
    await requireRole(["superadmin", "hr_admin"]);

    const file = formData.get("file") as File;

    if (!file) {
      return { error: "No file provided" };
    }

    // Basic validation
    if (file.size > 10 * 1024 * 1024) {
      return { error: "File must be under 10MB" };
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return { error: "Employee not found" };
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

    revalidatePath(`/hr/employees/${employeeId}`);
    return { success: true, fileUrl: uploadResult.url };
  } catch (error) {
    console.error("Error uploading document:", error);
    return { error: "Failed to upload document" };
  }
}
