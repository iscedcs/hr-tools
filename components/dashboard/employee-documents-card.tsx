"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { uploadEmployeeDocument } from "@/actions/upload-employee-docs";

type DocType = "cv" | "acceptance_letter" | "nda" | "hand_book";

interface DocumentRowProps {
  label: string;
  type: DocType;
  fileUrl?: string | null;
}

function DocumentRow({ label, type, fileUrl }: DocumentRowProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const res = await uploadEmployeeDocument(type, file);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`${label} uploaded`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center justify-between border rounded-md p-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              className="text-xs text-primary underline">
              View document
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">Not uploaded</p>
          )}
        </div>
      </div>

      <label>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}>
          {fileUrl ? (
            <>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Replace
            </>
          ) : (
            <>
              <UploadCloud
                className={`h-4 w-4 mr-2 ${
                  isUploading ? "animate-bounce text-primary" : ""
                }`}
              />{" "}
              Upload
            </>
          )}
        </Button>
      </label>
    </div>
  );
}

export function EmployeeDocumentsCard({
  cvUrl,
  acceptanceLetterUrl,
  ndaUrl,
  handbookUrl,
}: {
  cvUrl?: string | null;
  acceptanceLetterUrl?: string | null;
  ndaUrl?: string | null;
  handbookUrl?: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <DocumentRow label="Curriculum Vitae (CV)" type="cv" fileUrl={cvUrl} />
        <DocumentRow
          label="Acceptance Letter"
          type="acceptance_letter"
          fileUrl={acceptanceLetterUrl}
        />
        <DocumentRow label="NDA" type="nda" fileUrl={ndaUrl} />
        <DocumentRow
          label="Employee Handbook"
          type="hand_book"
          fileUrl={handbookUrl}
        />
      </CardContent>
    </Card>
  );
}
