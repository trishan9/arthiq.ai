import { useState, useCallback } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function DocumentUploadZone({ onUpload, isUploading }: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, Images, CSV, or Excel files.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > MAX_SIZE) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 50MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (validateFile(file)) {
        await onUpload(file);
      }
    }
  }, [onUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_TYPES.join(",");
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleFiles(target.files);
    };
    input.click();
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer",
        isDragging
          ? "border-accent bg-accent/5 scale-[1.01]"
          : "border-border hover:border-accent/50 hover:bg-muted/30",
        isUploading && "pointer-events-none opacity-60"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        ) : (
          <Upload className="w-8 h-8 text-accent" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {isUploading ? "Uploading..." : "Drop files here or click to upload"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Supports PDF, Images, CSV, and Excel files up to 50MB
      </p>
      <Button variant="accent" disabled={isUploading}>
        {isUploading ? "Processing..." : "Select Files"}
      </Button>
    </div>
  );
}
