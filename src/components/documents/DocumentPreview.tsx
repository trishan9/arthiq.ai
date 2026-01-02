import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  filePath: string;
  fileType: string;
}

export function DocumentPreview({ isOpen, onClose, fileName, filePath, fileType }: DocumentPreviewProps) {
  const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);
  const fileUrl = urlData.publicUrl;

  const isImage = fileType.startsWith("image/");
  const isPdf = fileType === "application/pdf";

  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              {fileName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, "_blank")}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center min-h-[400px]">
          {isImage && (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-[70vh] object-contain"
            />
          )}
          
          {isPdf && (
            <iframe
              src={`${fileUrl}#toolbar=0`}
              className="w-full h-[70vh] border-0"
              title={fileName}
            />
          )}

          {!isImage && !isPdf && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Preview not available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This file type cannot be previewed directly.
              </p>
              <Button variant="accent" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
