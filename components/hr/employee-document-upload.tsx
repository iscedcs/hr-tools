"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadEmployeeDocumentByHR } from "@/actions/hr-upload-employee-docs";

type DocType = "cv" | "acceptance_letter" | "nda" | "hand_book";

interface DocumentUploadRowProps {
  label: string;
  type: DocType;
  employeeId: string;
  fileUrl?: string | null;
}

function DocumentUploadRow({
  label,
  type,
  employeeId,
  fileUrl,
}: DocumentUploadRowProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadEmployeeDocumentByHR(employeeId, type, formData);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`${label} uploaded successfully`);
      // Reload to show updated document
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
    <div className="border rounded-lg p-4 space-y-2">
      <p className="font-medium text-sm">{label}</p>
      {fileUrl ? (
        <a
          className="text-sm text-primary underline block mb-2"
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer">
          View document
        </a>
      ) : (
        <p className="text-sm text-muted-foreground mb-2">Not uploaded</p>
      )}
      <label>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : fileUrl ? (
            <>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Replace
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </label>
    </div>
  );
}

interface EmployeeDocumentUploadProps {
  employeeId: string;
  documents: {
    cv?: string | null;
    acceptanceLetter?: string | null;
    nda?: string | null;
    handbook?: string | null;
  };
}

export function EmployeeDocumentUpload({
  employeeId,
  documents,
}: EmployeeDocumentUploadProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DocumentUploadRow
        label="CV"
        type="cv"
        employeeId={employeeId}
        fileUrl={documents.cv}
      />
      <DocumentUploadRow
        label="Acceptance Letter"
        type="acceptance_letter"
        employeeId={employeeId}
        fileUrl={documents.acceptanceLetter}
      />
      <DocumentUploadRow
        label="NDA"
        type="nda"
        employeeId={employeeId}
        fileUrl={documents.nda}
      />
      <DocumentUploadRow
        label="Employee Handbook"
        type="hand_book"
        employeeId={employeeId}
        fileUrl={documents.handbook}
      />
    </div>
  );
}
