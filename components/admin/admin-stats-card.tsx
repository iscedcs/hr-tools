import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, UserCheck } from "lucide-react";

interface AdminStatsCardsProps {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  pendingLeaves: number;
  todayAttendance: number;
}

export function AdminStatsCards({
  totalEmployees,
  activeEmployees,
  totalDepartments,
  pendingLeaves,
  todayAttendance,
}: AdminStatsCardsProps) {
  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      description: `${activeEmployees} active`,
      color: "text-blue-500",
    },
    {
      title: "Departments",
      value: totalDepartments,
      icon: Building2,
      description: "Active departments",
      color: "text-purple-500",
    },
    {
      title: "Pending Leaves",
      value: pendingLeaves,
      icon: Calendar,
      description: "Awaiting approval",
      color: "text-orange-500",
    },
    {
      title: "Today's Attendance",
      value: todayAttendance,
      icon: UserCheck,
      description: "Checked in today",
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
