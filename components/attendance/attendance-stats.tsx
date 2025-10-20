import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db"
import { BarChart3 } from "lucide-react"

interface AttendanceStatsProps {
  userId: string
}

export async function AttendanceStats({ userId }: AttendanceStatsProps) {
  const employee = await prisma.employee.findUnique({
    where: { userId },
  })

  if (!employee) {
    return null
  }

  // Get stats for current month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [totalDays, completedDays, hourStats] = await Promise.all([
    prisma.attendanceLog.count({
      where: {
        employeeId: employee.id,
        checkInTime: { gte: startOfMonth },
      },
    }),
    prisma.attendanceLog.count({
      where: {
        employeeId: employee.id,
        checkInTime: { gte: startOfMonth },
        status: "checked_out",
      },
    }),
    prisma.attendanceLog.aggregate({
      where: {
        employeeId: employee.id,
        checkInTime: { gte: startOfMonth },
      },
      _sum: { totalHours: true },
      _avg: { totalHours: true },
    }),
  ])

  const totalHours = hourStats._sum.totalHours || 0
  const avgHours = hourStats._avg.totalHours || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          This Month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Days</span>
            <span className="text-2xl font-bold">{totalDays}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Completed</span>
            <span className="text-2xl font-bold">{completedDays}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Hours</span>
            <span className="text-2xl font-bold">{Number(totalHours).toFixed(1)}h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Hours/Day</span>
            <span className="text-2xl font-bold">{Number(avgHours).toFixed(1)}h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
