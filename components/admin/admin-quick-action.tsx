import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Building2, FileText, Settings } from "lucide-react";
import Link from "next/link";

export function AdminQuickActions() {
  const actions = [
    {
      title: "Add Employee",
      icon: UserPlus,
      href: "/hr/employees/new",
      description: "Create new employee account",
    },
    {
      title: "Add Department",
      icon: Building2,
      href: "/hr/departments/new",
      description: "Create new department",
    },
    {
      title: "View Reports",
      icon: FileText,
      href: "/hr/reports",
      description: "Generate attendance reports",
    },
    {
      title: "System Settings",
      icon: Settings,
      href: "/hr/settings",
      description: "Configure system settings",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 bg-transparent">
              <action.icon className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
