"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Building2,
  Settings,
  BarChart3,
  Hash,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/hr", icon: LayoutDashboard },
  { name: "Employees", href: "/hr/employees", icon: Users },
  { name: "Attendance Logs", href: "/hr/attendance", icon: Clock },
  { name: "Manage Leave Requests", href: "/hr/leave-requests", icon: Calendar },
  { name: "Departments", href: "/hr/departments", icon: Building2 },
  { name: "Reports", href: "/hr/reports", icon: BarChart3 },
  { name: "Employee Codes", href: "/hr/employee-codes", icon: Hash },

  { name: "Settings", href: "/hr/settings", icon: Settings },
];

export function HRSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border hidden lg:block">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Clock className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-semibold">HR Dashboard</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
