"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { generateEmployeeCodes } from "@/actions/employee-code-actions";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const generateCodesSchema = z.object({
  count: z
    .number()
    .min(1, "Must generate at least 1 code")
    .max(100, "Cannot generate more than 100 codes at once"),
  prefix: z
    .string()
    .min(2, "Prefix must be at least 2 characters")
    .max(10, "Prefix must be at most 10 characters"),
});

type GenerateCodesForm = z.infer<typeof generateCodesSchema>;

export function GenerateCodesDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GenerateCodesForm>({
    resolver: zodResolver(generateCodesSchema),
    defaultValues: {
      count: 10,
      prefix: "EMP",
    },
  });

  const onSubmit = async (data: GenerateCodesForm) => {
    setIsLoading(true);
    const result = await generateEmployeeCodes(data);

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      reset();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Codes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Generate Employee Codes</DialogTitle>
            <DialogDescription>
              Create new employee identification codes in bulk
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="count">Number of Codes</Label>
              <Input
                id="count"
                type="number"
                {...register("count", { valueAsNumber: true })}
                placeholder="10"
              />
              {errors.count && (
                <p className="text-sm text-destructive">
                  {errors.count.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefix">Code Prefix</Label>
              <Input id="prefix" {...register("prefix")} placeholder="EMP" />
              {errors.prefix && (
                <p className="text-sm text-destructive">
                  {errors.prefix.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Codes will be generated as: {register("prefix").name || "EMP"}
                XXXXXX
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
