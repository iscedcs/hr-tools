"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { saveBankDetails } from "@/actions/employee-bank-details";

const schema = z.object({
  bankName: z.string().min(2),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be 10 digits"),
  accountName: z.string().min(2),
});

type FormData = z.infer<typeof schema>;
type Status = "LOCKED" | "PENDING_APPROVAL" | "EDITABLE";

export function EmployeeBankDetailsCard({
  defaultValues,
  status = "EDITABLE",
}: {
  defaultValues?: Partial<FormData>;
  status?: Status;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(status === "EDITABLE");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankName: defaultValues?.bankName ?? "",
      accountNumber: defaultValues?.accountNumber ?? "",
      accountName: defaultValues?.accountName ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const res = await saveBankDetails(null, data);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Bank details saved");
      setIsEditing(false); // lock form after save
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground">
              Your bank details are visible only to HR and Finance.
            </p>

            {/* ACTIONS */}
            {isEditing && (
              <Button type="submit" className="w-full" disabled={isSaving}>
                Save Bank Details
              </Button>
            )}
          </form>
        </Form>

        {!isEditing && status === "LOCKED" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast.info("Request sent to HR")}>
            Request Account Update
          </Button>
        )}

        {!isEditing && status === "PENDING_APPROVAL" && (
          <p className="text-sm text-muted-foreground text-center">
            Update request pending HR approval
          </p>
        )}

        {!isEditing && status === "EDITABLE" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsEditing(true)}>
            Update Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
