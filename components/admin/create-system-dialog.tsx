"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createSystemSetting } from "@/actions/admin-actions";

const settingSchema = z.object({
  settingKey: z.string().min(1, "Setting key is required"),
  settingValue: z.string().min(1, "Setting value is required"),
  description: z.string().optional(),
});

export function CreateSettingDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof settingSchema>>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      settingKey: "",
      settingValue: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof settingSchema>) => {
    const result = await createSystemSetting(
      data.settingKey,
      data.settingValue,
      data.description
    );

    if (result.success) {
      toast.success("Setting created successfully");
      setOpen(false);
      form.reset();
    } else {
      toast.error(result.error || "Failed to create setting");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create System Setting</DialogTitle>
          <DialogDescription>
            Add a new system configuration setting
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="settingKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setting Key</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., max_login_attempts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settingValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setting Value</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 5" {...field} />
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
                    <Textarea
                      placeholder="Describe what this setting controls"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Setting"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
