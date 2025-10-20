import type { UserRole } from "@/lib/types"

declare module "next-auth" {
  interface User {
    role?: UserRole
    employeeCode?: string
    departmentId?: number
    position?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      employeeCode: string
      departmentId: number
      position: string
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole
    employeeCode?: string
    departmentId?: number
    position?: string
  }
}
