"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSystemSetting } from "@/actions/admin-actions";

const settingSchema = z.object({
  settingValue: z.string().min(1, "Setting value is required"),
  description: z.string().optional(),
});

interface EditSettingDialogProps {
  setting: {
    id: string;
    settingKey: string;
    settingValue: string;
    description: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSettingDialog({
  setting,
  open,
  onOpenChange,
}: EditSettingDialogProps) {
  const form = useForm<z.infer<typeof settingSchema>>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      settingValue: setting.settingValue,
      description: setting.description || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof settingSchema>) => {
    const result = await updateSystemSetting(
      setting.id,
      data.settingValue,
      data.description
    );

    if (result.success) {
      toast.success("Setting updated successfully");
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to update setting");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit System Setting</DialogTitle>
          <DialogDescription>
            Update the value and description for {setting.settingKey}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="settingValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setting Value</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Update Setting"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
