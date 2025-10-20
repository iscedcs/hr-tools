"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { generateAttendanceReport } from "@/actions/report-actions"
import { format } from "date-fns"

export function AttendanceSummaryReport() {
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(1)), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateAttendanceReport(startDate, endDate)
      if (result.error) {
        toast.error(result.error)
      } else {
        setReportData(result.data)
        toast.success("Report generated successfully")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    if (!reportData) return

    const csv = [
      ["Employee Code", "Name", "Department", "Total Days", "Present", "Absent", "Late", "Total Hours", "Avg Hours"],
      ...reportData.map((row: any) => [
        row.employee_code,
        row.employee_name,
        row.department_name || "N/A",
        row.total_days,
        row.present_days,
        row.absent_days,
        row.late_days,
        row.total_hours,
        row.avg_hours,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-report-${startDate}-to-${endDate}.csv`
    a.click()
    toast.success("Report exported successfully")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleGenerate} disabled={isLoading} className="flex-1">
                Generate Report
              </Button>
              {reportData && (
                <Button onClick={handleExport} variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary ({reportData.length} employees)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Code</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Days</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Present</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Absent</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Late</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Hours</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Avg Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row: any, index: number) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-medium">{row.employee_name}</td>
                      <td className="py-3 px-4 text-sm">{row.employee_code}</td>
                      <td className="py-3 px-4 text-sm">{row.department_name || "N/A"}</td>
                      <td className="py-3 px-4 text-sm text-right">{row.total_days}</td>
                      <td className="py-3 px-4 text-sm text-right">{row.present_days}</td>
                      <td className="py-3 px-4 text-sm text-right">{row.absent_days}</td>
                      <td className="py-3 px-4 text-sm text-right">{row.late_days}</td>
                      <td className="py-3 px-4 text-sm text-right">{Number(row.total_hours).toFixed(1)}</td>
                      <td className="py-3 px-4 text-sm text-right">{Number(row.avg_hours).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
