import type {
  UserRole as PrismaUserRole,
  AttendanceStatus as PrismaAttendanceStatus,
  LeaveStatus as PrismaLeaveStatus,
} from "@prisma/client"

export type UserRole = PrismaUserRole
export type AttendanceStatus = PrismaAttendanceStatus
export type LeaveStatus = PrismaLeaveStatus

export interface Employee {
  id: string
  user_id: string
  employee_code: string
  role: UserRole
  department_id: number | null
  position: string | null
  phone_number: string | null
  nfc_card_id: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Joined from users_sync
  name?: string
  email?: string
}

export interface Department {
  id: number
  name: string
  description: string | null
  manager_id: string | null
  created_at: Date
  updated_at: Date
}

export interface AttendanceLog {
  id: number
  employee_id: string
  check_in_time: Date
  check_out_time: Date | null
  status: AttendanceStatus
  check_in_location: string | null
  check_out_location: string | null
  check_in_method: string
  check_out_method: string | null
  notes: string | null
  total_hours: number | null
  created_at: Date
  updated_at: Date
  // Joined data
  employee_name?: string
  employee_code?: string
  department_name?: string
}

export interface LeaveRequest {
  id: number
  employee_id: string
  leave_type: string
  start_date: Date
  end_date: Date
  total_days: number
  reason: string | null
  status: LeaveStatus
  approved_by: string | null
  approved_at: Date | null
  rejection_reason: string | null
  created_at: Date
  updated_at: Date
  // Joined data
  employee_name?: string
  approver_name?: string
}

export interface Notification {
  id: number
  employee_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: Date
}

export interface SystemSetting {
  id: number
  setting_key: string
  setting_value: string
  description: string | null
  updated_at: Date
}

export interface AttendanceStats {
  total_employees: number
  checked_in: number
  checked_out: number
  absent: number
  late: number
  on_leave: number
}

export interface EmployeeAttendanceSummary {
  employee_id: string
  employee_name: string
  employee_code: string
  department: string
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  total_hours: number
  average_hours: number
}
