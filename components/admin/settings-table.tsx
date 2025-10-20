"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { EditSettingDialog } from "./edit-setting-dialog";
import { toast } from "sonner";
import { deleteSystemSetting } from "@/actions/admin-actions";

export function SettingsTable({ settings }: { settings: Setting[] }) {
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this setting?")) return;

    const result = await deleteSystemSetting(id);
    if (result.success) {
      toast.success("Setting deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete setting");
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg border border-border">
        <Table className="min-w-[650px]">
          <TableHeader>
            <TableRow>
              <TableHead>Setting Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground">
                  No settings found. Create your first setting to get started.
                </TableCell>
              </TableRow>
            ) : (
              settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-mono text-sm break-all">
                    {setting.settingKey}
                  </TableCell>
                  <TableCell>{setting.settingValue}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[180px] truncate sm:whitespace-normal">
                    {setting.description || "—"}
                  </TableCell>
                  <TableCell>
                    {new Date(setting.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSetting(setting);
                          setIsEditOpen(true);
                        }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(setting.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedSetting && (
        <EditSettingDialog
          setting={selectedSetting}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </>
  );
}
