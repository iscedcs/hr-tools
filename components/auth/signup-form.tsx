"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import { signUpAction } from "@/actions/auth-actions";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  employeeCode: z.string().min(3, "Employee code is required"),
  position: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "Invalid date of birth",
  }),
  dateOfJoining: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "Invalid joining date",
  }),
  resumptionDate: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "Invalid resumption date",
  }),
  employmentStatus: z.enum(["intern", "contract", "full_time"]),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      employmentStatus: "full_time",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const result = await signUpAction(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Create account
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your details to create your account
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* ================= ACCOUNT information ================= */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold">Account information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="enter your fullname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="enter your email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="EMP001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* ================= EMPLOYMENT INFO ================= */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Employment information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full border rounded-md px-3 py-2 bg-background">
                          <option value="full_time">Full Time</option>
                          <option value="contract">Contract</option>
                          <option value="intern">Intern</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Software Engineer/ Intern"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+234 800 000 0000" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* ================= IMPORTANT DATES ================= */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Important dates
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfJoining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Joining</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resumptionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumption Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </form>
    </Form>

    // <Card>
    //   <CardHeader className="space-y-1">
    //     <h2 className="text-2xl font-semibold tracking-tight">
    //       Create account
    //     </h2>
    //     <p className="text-sm text-muted-foreground">
    //       Enter your details to create your account
    //     </p>
    //   </CardHeader>
    //   <form onSubmit={handleSubmit(onSubmit)}>
    //     <CardContent className="space-y-4 ">
    //       <div className="grid grid-cols-2 gap-4 space-y-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="name">Full Name</Label>
    //           <Input
    //             id="name"
    //             placeholder="John Doe"
    //             {...register("name")}
    //             disabled={isLoading}
    //           />
    //           {errors.name && (
    //             <p className="text-sm text-destructive">
    //               {errors.name.message}
    //             </p>
    //           )}
    //         </div>
    //         <div className="space-y-2">
    //           <Label htmlFor="email">Email</Label>
    //           <Input
    //             id="email"
    //             type="email"
    //             placeholder="you@example.com"
    //             {...register("email")}
    //             disabled={isLoading}
    //           />
    //           {errors.email && (
    //             <p className="text-sm text-destructive">
    //               {errors.email.message}
    //             </p>
    //           )}
    //         </div>
    //         <div className="space-y-2">
    //           <Label htmlFor="employeeCode">Employee Code</Label>
    //           <Input
    //             id="employeeCode"
    //             placeholder="EMP001"
    //             {...register("employeeCode")}
    //             disabled={isLoading}
    //           />
    //           {errors.employeeCode && (
    //             <p className="text-sm text-destructive">
    //               {errors.employeeCode.message}
    //             </p>
    //           )}
    //         </div>
    //         <div className="space-y-2">
    //           <Label htmlFor="position">Position (Optional)</Label>
    //           <Input
    //             id="position"
    //             placeholder="Software Engineer/ Intern"
    //             {...register("position")}
    //             disabled={isLoading}
    //           />
    //         </div>
    //         <div className="space-y-2">
    //           <Label>Date of Birth</Label>
    //           <Input type="date" {...register("dateOfBirth")} />
    //           {errors.dateOfBirth && (
    //             <p className="text-sm text-destructive">
    //               {errors.dateOfBirth.message}
    //             </p>
    //           )}
    //         </div>

    //         <div className="space-y-2">
    //           <Label>Date of Joining</Label>
    //           <Input type="date" {...register("dateOfJoining")} />
    //         </div>

    //         <div className="space-y-2">
    //           <Label>Resumption Date</Label>
    //           <Input type="date" {...register("resumptionDate")} />
    //         </div>
    //         <div className="space-y-2">
    //           <Label>Employment Status</Label>
    //           <select
    //             {...register("employmentStatus")}
    //             className="w-full border rounded-md px-3 py-2 bg-background">
    //             <option value="full_time">Full Time</option>
    //             <option value="contract">Contract</option>
    //             <option value="intern">Intern</option>
    //           </select>
    //         </div>
    //         <div className="space-y-2">
    //           <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
    //           <Input
    //             id="phoneNumber"
    //             placeholder="+234 800 000 0000"
    //             {...register("phoneNumber")}
    //             disabled={isLoading}
    //           />
    //         </div>
    //         <div className="space-y-2">
    //           <Label htmlFor="password">Password</Label>
    //           <Input
    //             id="password"
    //             type="password"
    //             placeholder="••••••••"
    //             {...register("password")}
    //             disabled={isLoading}
    //           />
    //           {errors.password && (
    //             <p className="text-sm text-destructive">
    //               {errors.password.message}
    //             </p>
    //           )}
    //         </div>
    //       </div>
    //     </CardContent>
    //     <CardFooter className="flex flex-col space-y-4">
    //       <Button type="submit" className="w-full" disabled={isLoading}>
    //         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    //         Create account
    //       </Button>
    //       <p className="text-sm text-center text-muted-foreground">
    //         Already have an account?{" "}
    //         <Link href="/login" className="text-primary hover:underline">
    //           Sign in
    //         </Link>
    //       </p>
    //     </CardFooter>
    //   </form>
    // </Card>
  );
}
