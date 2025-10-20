"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subMonths } from "date-fns";

export async function MonthlyTrendsChart() {
  // Get data for last 6 months
  const sixMonthsAgo = subMonths(new Date(), 6);

  const monthlyData = await prisma.$queryRaw<
    Array<{
      month: Date;
      unique_employees: bigint;
      total_check_ins: bigint;
      avg_hours: number;
    }>
  >`
    SELECT 
      DATE_TRUNC('month', check_in_time) as month,
      COUNT(DISTINCT employee_id) as unique_employees,
      COUNT(*) as total_check_ins,
      COALESCE(AVG(total_hours), 0) as avg_hours
    FROM attendance_logs
    WHERE check_in_time >= ${sixMonthsAgo}
    AND status = 'checked_out'
    GROUP BY DATE_TRUNC('month', check_in_time)
    ORDER BY month ASC
  `;

  const chartData = monthlyData.map((row) => ({
    month: format(new Date(row.month), "MMM yyyy"),
    employees: Number(row.unique_employees),
    checkIns: Number(row.total_check_ins),
    avgHours: Number(row.avg_hours).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trends (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="employees"
                  stroke="hsl(var(--primary))"
                  name="Active Employees"
                />
                <Line
                  type="monotone"
                  dataKey="checkIns"
                  stroke="hsl(var(--chart-2))"
                  name="Total Check-ins"
                />
                <Line
                  type="monotone"
                  dataKey="avgHours"
                  stroke="hsl(var(--chart-3))"
                  name="Avg Hours/Day"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Month
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Active Employees
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Total Check-ins
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Avg Hours/Day
                  </th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm font-medium">
                      {row.month}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {row.employees}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {row.checkIns}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {row.avgHours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
