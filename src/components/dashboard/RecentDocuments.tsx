import { FileText, Image, FileSpreadsheet, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDocuments } from "@/hooks/useDocuments";

const getFileIcon = (type: string) => {
  if (type.includes("pdf")) return <FileText className="w-5 h-5 text-destructive" />;
  if (type.includes("image")) return <Image className="w-5 h-5 text-info" />;
  if (type.includes("spreadsheet") || type.includes("csv") || type.includes("excel")) return <FileSpreadsheet className="w-5 h-5 text-success" />;
  return <FileText className="w-5 h-5 text-muted-foreground" />;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "processed": return <CheckCircle className="w-4 h-4 text-success" />;
    case "processing": return <Clock className="w-4 h-4 text-warning animate-pulse" />;
    case "pending": return <Clock className="w-4 h-4 text-muted-foreground" />;
    case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
    default: return null;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const RecentDocuments = () => {
  const navigate = useNavigate();
  const { documents, isLoading } = useDocuments();
  const recentDocs = documents.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Documents</h3>
            <p className="text-sm text-muted-foreground">Your recently uploaded financial documents</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/documents")}>
            View All
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      ) : recentDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No documents uploaded yet</p>
          <Button 
            variant="link" 
            size="sm" 
            className="mt-2" 
            onClick={() => navigate("/dashboard/documents")}
          >
            Upload your first document
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recentDocs.map((doc) => (
            <div 
              key={doc.id} 
              className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 cursor-pointer"
              onClick={() => navigate("/dashboard/documents")}
            >
              {/* File Icon */}
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {getFileIcon(doc.file_type)}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                </p>
              </div>
              
              {/* Status */}
              <div className="hidden sm:block">
                {getStatusIcon(doc.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentDocuments;
