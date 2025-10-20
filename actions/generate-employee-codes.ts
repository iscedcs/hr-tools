// import { prisma } from "@/lib/db";

// function generateCode(index: number): string {
//   const padded = index.toString().padStart(3, "0");
//   return `ISCE${padded}EM`;
// }

// export async function generateEmployeeCodes(count = 500) {
//   const codes = Array.from({ length: count }).map((_, i) => ({
//     code: generateCode(i + 1),
//   }));

//   try {
//     await prisma.employeeCode.createMany({
//       data: codes,
//       skipDuplicates: true,
//     });
//     console.log(`${codes.length} codes generated.`);
//   } catch (error) {
//     console.error("Code generation failed:", error);
//   }
// }

// generateEmployeeCodes();
