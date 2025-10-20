"use client";

import { signOutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AdminHeader() {
  const router = useRouter();

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
    <header className="border-b border-border bg-card px-4 md:px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center md:pl-0 pl-13 gap-3">
          <h1 className="text-lg font-semibold text-foreground">
            System Administration
          </h1>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="hidden md:flex">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={handleSignOut}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
