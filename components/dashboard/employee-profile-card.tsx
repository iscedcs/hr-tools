"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { uploadEmployeeDocument } from "@/actions/upload-employee-docs";

interface EmployeeProfileCardProps {
  name: string;
  email: string;
  position?: string;
  profileImageUrl?: string | null;
}

export function EmployeeProfileCard({
  name,
  email,
  position,
  profileImageUrl,
}: EmployeeProfileCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await uploadEmployeeDocument("profile_picture", file);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Profile photo updated");
      window.location.reload(); // safe + simple for now
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Profile</CardTitle>
      </CardHeader>

      <CardContent className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20 ring-1 ring-border">
            <AvatarImage
              className="object-cover transition-opacity"
              src={profileImageUrl ?? undefined}
            />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />

          <Button
            size="icon"
            variant="secondary"
            className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}>
            <Camera className={isUploading ? "animate-spin" : ""} size={14} />
          </Button>
        </div>

        <div className="flex-1">
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
          <p className="text-xs text-muted-foreground">
            {position ?? "Employee"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
