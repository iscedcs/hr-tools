import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";
import { generateMetadata as generateDynamicMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateDynamicMetadata("/login");
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your attendance dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
