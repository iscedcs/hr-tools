"use client";

import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { signOutAction } from "@/actions/auth-actions";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string;
    role: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  // const isAdmin = user.role === "superadmin" || user.role === "hr_admin";

  const handleSignOut = async () => {
    const result = await signOutAction();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Attendance System</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/hr">HR Dashboard</Link>
            </Button>
          )} */}
          <NotificationCenter userId={user.id} />
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
