import type React from "react"
import { requireRole } from "@/lib/auth-utils"
import { HRSidebar } from "@/components/hr/hr-sidebar"
import { HRHeader } from "@/components/hr/hr-header"

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["superadmin", "hr_admin"])

  return (
    <div className="min-h-screen bg-background">
      <HRSidebar />
      <div className="lg:pl-64">
        <HRHeader />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
