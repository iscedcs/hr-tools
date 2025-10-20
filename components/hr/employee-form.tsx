"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEmployee } from "@/actions/employee-actions";
import { toast } from "sonner";
import type { Department } from "@prisma/client";
import { validateEmployeeCode } from "@/actions/validate-employee-code";

const employeeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  employeeCode: z.string().min(2, "Employee code is required"),
  role: z.enum(["superadmin", "hr_admin", "employee"]),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  phoneNumber: z.string().optional(),
  nfcCardId: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  departments: Department[];
}

export function EmployeeForm({ departments }: EmployeeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [codeStatus, setCodeStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: "employee",
    },
  });

  const role = watch("role");

  useEffect(() => {
    const code = watch("employeeCode");
    if (!code || code.length < 4) {
      setCodeStatus("idle");
      return;
    }

    const check = setTimeout(async () => {
      setCodeStatus("checking");
      const isValid = await validateEmployeeCode(code);
      setCodeStatus(isValid ? "valid" : "invalid");
    }, 600); // debounce

    return () => clearTimeout(check);
  }, [watch("employeeCode")]);

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);

    const isValid = await validateEmployeeCode(data.employeeCode);
    if (!isValid) {
      toast.error("Invalid or already used employee code");
      setIsLoading(false);
      return;
    }
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        formData.append(key, value.toString());
      }
    });

    const result = await createEmployee(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Employee created successfully");
      router.push("/hr/employees");
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code *</Label>
              <Input
                id="employeeCode"
                {...register("employeeCode")}
                placeholder="ISCE001EM"
                className={codeStatus === "invalid" ? "border-red-500" : ""}
              />
              {errors.employeeCode && (
                <p className="text-sm text-destructive">
                  {errors.employeeCode.message}
                </p>
              )}
              {codeStatus === "checking" && (
                <p className="text-sm text-muted-foreground">
                  Checking code...
                </p>
              )}
              {codeStatus === "valid" && (
                <p className="text-sm text-green-600">Code is valid ✅</p>
              )}
              {codeStatus === "invalid" && (
                <p className="text-sm text-destructive">
                  Invalid or already used
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value) => setValue("role", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr_admin">HR Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                onValueChange={(value) => setValue("departmentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                {...register("position")}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nfcCardId">NFC Card ID</Label>
              <Input
                id="nfcCardId"
                {...register("nfcCardId")}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Employee"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
