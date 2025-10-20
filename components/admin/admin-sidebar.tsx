"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  BarChart3,
  Activity,
  Database,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "System Health",
    href: "/admin/system-health",
    icon: Activity,
  },
  {
    title: "Bulk Operations",
    href: "/admin/bulk-operations",
    icon: Database,
  },
  {
    title: "Security Center",
    href: "/admin/security",
    icon: Shield,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
        <div className="p-6 flex items-center justify-between border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Super Admin</h2>
            <p className="text-xs text-muted-foreground mt-1">
              System Control Panel
            </p>
          </div>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}>
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      <button
        className="lg:hidden fixed top-4  left-1 z-50 bg-card border border-border p-2 rounded-md shadow-md"
        onClick={() => setIsOpen(true)}>
        <LayoutDashboard className="h-5 w-5" />
      </button>
    </>
  );
}
