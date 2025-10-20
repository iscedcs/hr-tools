import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceSummaryReport } from "@/components/reports/attendance-summary-report"
import { DepartmentReport } from "@/components/reports/department-report"
import { LateArrivalsReport } from "@/components/reports/late-arrivals-report"
import { MonthlyTrendsChart } from "@/components/reports/monthly-trends-chart"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Reports & Analytics</h2>
        <p className="text-muted-foreground">Generate comprehensive attendance reports and insights</p>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
          <TabsTrigger value="late">Late Arrivals</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <AttendanceSummaryReport />
        </TabsContent>

        <TabsContent value="department" className="space-y-6">
          <DepartmentReport />
        </TabsContent>

        <TabsContent value="late" className="space-y-6">
          <LateArrivalsReport />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <MonthlyTrendsChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
