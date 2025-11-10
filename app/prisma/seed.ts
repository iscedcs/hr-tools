// import bcrypt from "bcryptjs";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Starting database seed...");

//   //   const superadminCode = await prisma.employeeCode.findFirst({
//   //     where: { assigned: false },
//   //   });
//   //   const hrCode = await prisma.employeeCode.findFirst({
//   //     where: { assigned: false, NOT: { id: superadminCode?.id } },
//   //   });

//   //   if (!superadminCode || !hrCode) {
//   //     throw new Error("Not enough available employee codes to assign.");
//   //   }

//   //   // Create admin user
//   //   const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);

//   //   const superadmin = await prisma.user.upsert({
//   //     where: { email: "isceofficial@gmail.com" },
//   //     update: {},
//   //     include: { employee: true },
//   //     create: {
//   //       email: "isceofficial@gmail.com",
//   //       password: hashedPassword,
//   //       name: "SuperAdmin",

//   //       employee: {
//   //         create: {
//   //           role: "superadmin",
//   //           position: "System Admin",
//   //           isActive: true,
//   //           employeeCode: {
//   //             connect: { id: superadminCode.id },
//   //           },
//   //         },
//   //       },
//   //     },
//   //   });

//   //   await prisma.employeeCode.update({
//   //     where: { id: superadminCode.id },
//   //     include: { Employee: true },
//   //     data: {
//   //       assigned: true,
//   //       assignedTo: superadmin.id,
//   //       assignedAt: new Date(),
//   //       employeeId: superadmin.employee?.id,
//   //     },
//   //   });

//   //   console.log("✅ Admin user created:", superadmin.email);

//   //   const hrHashedPassword = await bcrypt.hash("Veenebeli8@", 10);
//   //   const hrAdmin = await prisma.user.upsert({
//   //     where: { email: "victoriaenebeli8@gmail.com" },
//   //     update: {},
//   //     create: {
//   //       email: "victoriaenebeli8@gmail.com",
//   //       password: hrHashedPassword,
//   //       name: "Admin User",
//   //       employee: {
//   //         create: {
//   //           role: "hr_admin",
//   //           position: "HR Manager",
//   //           isActive: true,
//   //           employeeCode: {
//   //             connect: {
//   //               id: hrCode.id,
//   //             },
//   //           },
//   //         },
//   //       },
//   //     },
//   //     include: {
//   //       employee: true,
//   //     },
//   //   });

//   //   await prisma.employeeCode.update({
//   //     where: { id: hrCode.id },
//   //     data: {
//   //       assigned: true,
//   //       assignedTo: hrAdmin.id,
//   //       assignedAt: new Date(),
//   //       employeeId: hrAdmin.employee?.id,
//   //     },
//   //   });

//   //   console.log(
//   //     "✅ Superadmin and HR admin seeded successfully.",
//   //     hrAdmin.email,
//   //     superadmin.email
//   //   );

//   //   console.log("🎉 Database seed completed successfully!");
//   // }
//   const settings = [
//     {
//       settingKey: "security_level",
//       settingValue: "High",
//       description:
//         "Indicates the current system security level based on configuration and activity health.",
//     },
//     {
//       settingKey: "attendance_cutoff_time",
//       settingValue: "09:00",
//       description: "Employees must check in before this time each day.",
//     },
//     {
//       settingKey: "max_leave_days",
//       settingValue: "30",
//       description:
//         "Maximum number of leave days an employee can take per year.",
//     },
//     {
//       settingKey: "auto_backup_enabled",
//       settingValue: "true",
//       description: "Whether daily automated database backups are enabled.",
//     },
//     {
//       settingKey: "password_policy",
//       settingValue: "strong",
//       description:
//         "Defines the required password strength: weak | medium | strong.",
//     },
//   ];

//   for (const setting of settings) {
//     await prisma.systemSetting.upsert({
//       where: { settingKey: setting.settingKey },
//       update: {},
//       create: setting,
//     });
//   }

//   console.log("✅ System settings seeded successfully.");
// }

// main()
//   .catch((e) => {
//     console.error("❌ Error seeding database:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
