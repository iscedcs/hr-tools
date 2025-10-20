"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export async function DepartmentReport() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const departmentStats = await prisma.$queryRaw<
    Array<{
      department: string;
      total_employees: bigint;
      active_employees: bigint;
      total_hours: number;
      avg_hours: number;
    }>
  >`
    SELECT 
      d.name as department,
      COUNT(DISTINCT e.id) as total_employees,
      COUNT(DISTINCT a.employee_id) as active_employees,
      COALESCE(SUM(a.total_hours), 0) as total_hours,
      COALESCE(AVG(a.total_hours), 0) as avg_hours
    FROM departments d
    LEFT JOIN employees e ON e.department_id = d.id AND e.is_active = true
    LEFT JOIN attendance_logs a ON a.employee_id = e.id 
      AND a.check_in_time >= ${startOfMonth}
      AND a.status = 'checked_out'
    GROUP BY d.id, d.name
    ORDER BY d.name
  `;

  const chartData = departmentStats.map((dept) => ({
    department: dept.department,
    employees: Number(dept.total_employees),
    avgHours: Number(dept.avg_hours).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Department Performance (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="employees"
                  fill="hsl(var(--primary))"
                  name="Total Employees"
                />
                <Bar
                  dataKey="avgHours"
                  fill="hsl(var(--chart-2))"
                  name="Avg Hours/Day"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Department
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Total Employees
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Active This Month
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Total Hours
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Avg Hours/Day
                  </th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((dept, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm font-medium">
                      {dept.department}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {Number(dept.total_employees)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {Number(dept.active_employees)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {Number(dept.total_hours).toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {Number(dept.avg_hours).toFixed(1)}
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
