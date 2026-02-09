# 🕴 ISCE HR Tools

**ISCE HR Tools** is a smart, NFC-enabled human resource management platform for attendance tracking, staff onboarding, and workforce visibility — built as part of the ISCE Ecosystem.

This system empowers HR teams to monitor employee presence with real-time check-ins/check-outs, while providing employees with a seamless, secure, and tamper-proof attendance experience.

---

## 🔑 Key Features 

- ✅ **Contactless Check-In/Out:**  
  NFC-enabled check-in using office-issued cards or shared devices. Logs timestamps and ensures physical presence.

- 🧍‍♂️ **Controlled Employee Onboarding:**  
  Pre-generated HR codes (e.g., `ISCE123EM`) required for registration. Prevents unauthorized access.

- 📅 **Live Attendance Dashboard:**  
  HR/admins can view real-time check-in activity, active staff, and missed logs.

- 📊 **Timesheet Logs & Export:**  
  Full history of daily attendance records per staff. View hours worked and export logs for payroll.

- 🔐 **Role-Based Access Control:**  
  Admin, HR, and Superadmin roles for structured permission and visibility.

- 📱 **Shared Device Mode:**  
  Configure a single office tablet/phone as the official check-in device. No individual logins required.

---

## 🧩 Integrations

- **ISCE Access:** Tap-to-enter door control and security logs  
- **ISCE Vault:** Store staff files, documents, and employment letters  
- **ISCE Connect:** Sync staff public profiles and contact info  
- **ISCE Events:** Log attendance at internal events and trainings

---

## 🛠 Tech Stack

- **Frontend:** Next.js, TypeScript, TailwindCSS, Shadcn UI  
- **Backend:** Prisma (PostgreSQL), Server Actions, Role-based auth  
- **Deployment:** Vercel / DigitalOcean  
- **NFC Check-in:** Web-compatible devices or Android tablets with NFC

---

## 📍 Getting Started

1. Clone the repo  
2. Set up your `.env` with DB and auth credentials  
3. Start the dev server with `npm run dev`  
4. HR can generate staff codes, and employees can register using them

---

## 🤝 Contributing

Coming soon. Internal use only for now.

---

> For support or integration help, contact the ISCE Platform Team.
