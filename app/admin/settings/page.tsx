import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getSystemSettings } from "@/actions/admin-actions";
import { CreateSettingDialog } from "@/components/admin/create-system-dialog";
import { SettingsTable } from "@/components/admin/settings-table";

export default async function AdminSettingsPage() {
  const result = await getSystemSettings();
  const settings: Setting[] = result.success ? result.data! : [];
  const securityLevel =
    settings.find((s) => s.settingKey === "security_level")?.settingValue ??
    "N/A";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">System Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage advanced system configuration and preferences
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <CreateSettingDialog>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Setting
            </Button>
          </CreateSettingDialog>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Settings</CardTitle>
            <CardDescription>System configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-3xl font-bold">
              {settings?.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Level</CardTitle>
            <CardDescription>Current security status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-500">
              {securityLevel}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
            <CardDescription>Most recent change</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {settings[0]?.updatedAt
                ? new Date(settings[0].updatedAt).toLocaleDateString()
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Configuration Settings
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Manage system-wide settings and configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="min-w-full">
            <SettingsTable settings={settings} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
