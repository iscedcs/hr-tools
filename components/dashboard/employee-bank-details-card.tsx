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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { saveBankDetails } from "@/actions/employee-bank-details";
import { requestBankUpdate } from "@/actions/request-bank-update";

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
  status = "LOCKED",
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
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bank Details</CardTitle>

        {status === "LOCKED" && <Badge variant="secondary">Locked</Badge>}
        {status === "PENDING_APPROVAL" && (
          <Badge variant="outline">Pending HR Approval</Badge>
        )}
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

            {/* SAVE */}
            {isEditing && (
              <Button type="submit" className="w-full" disabled={isSaving}>
                Save Bank Details
              </Button>
            )}
          </form>
        </Form>

        {/* ACTIONS */}
        {status === "EDITABLE" && !isEditing && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsEditing(true)}>
            Update Account
          </Button>
        )}

        {status === "LOCKED" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              const res = await requestBankUpdate();
              if (res?.error) toast.error(res.error);
              else toast.success("Request sent to HR");
            }}>
            Request Account Update
          </Button>
        )}

        {status === "PENDING_APPROVAL" && (
          <p className="text-sm text-muted-foreground text-center">
            Awaiting HR approval
          </p>
        )}
      </CardContent>
    </Card>
  );
}
