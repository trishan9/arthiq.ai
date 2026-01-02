import { useState } from "react";
import { FileText, Image, FileSpreadsheet, Grid, List, Search, MoreVertical, CheckCircle, Clock, AlertCircle, Trash2, Eye, Loader2, FileImage, Plus, PenLine, BarChart3, Scale } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDocuments, Document } from "@/hooks/useDocuments";
import { DocumentUploadZone } from "@/components/documents/DocumentUploadZone";
import { ExtractedDataView } from "@/components/documents/ExtractedDataView";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { ManualEntryDialog } from "@/components/documents/ManualEntryDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = ["All", "Bank Statements", "Invoices", "Expenses", "Tax Documents", "P&L Statements", "Balance Sheets", "Payroll"];

const categoryMap: Record<string, string> = {
  "Bank Statements": "bank_statement",
  "Invoices": "invoice",
  "Expenses": "receipt",
  "Tax Documents": "tax_document",
  "P&L Statements": "profit_loss",
  "Balance Sheets": "balance_sheet",
  "Payroll": "payroll",
};

const getFileIcon = (type: string, docType?: string) => {
  if (docType === "profit_loss") return <BarChart3 className="w-6 h-6 text-success" />;
  if (docType === "balance_sheet") return <Scale className="w-6 h-6 text-info" />;
  if (type === "manual_entry") return <PenLine className="w-6 h-6 text-accent" />;
  if (type.includes("pdf")) return <FileText className="w-6 h-6 text-destructive" />;
  if (type.includes("image")) return <Image className="w-6 h-6 text-info" />;
  if (type.includes("spreadsheet") || type.includes("csv") || type.includes("excel")) return <FileSpreadsheet className="w-6 h-6 text-success" />;
  return <FileText className="w-6 h-6 text-muted-foreground" />;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "processed":
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" />Processed</span>;
    case "processing":
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full"><Clock className="w-3 h-3" />Processing</span>;
    case "pending":
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full"><Clock className="w-3 h-3" />Pending</span>;
    case "error":
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full"><AlertCircle className="w-3 h-3" />Error</span>;
    default: 
      return null;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Documents = () => {
  const { documents, isLoading, isUploading, uploadDocument, deleteDocument, refetch } = useDocuments();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "All" || doc.document_type === categoryMap[selectedCategory];
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpload = async (file: File) => {
    await uploadDocument(file);
  };

  const handleDelete = async (doc: Document) => {
    await deleteDocument(doc.id, doc.file_path);
  };

  const handleViewData = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Documents" 
        subtitle="Manage and process your financial documents with AI-powered OCR"
        showAddButton={false}
      />
      
      <div className="p-6 space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowManualEntry(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Manual Entry
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {documents.length} documents • {documents.filter(d => d.status === "processed").length} processed
          </div>
        </div>

        {/* Upload Area */}
        <DocumentUploadZone onUpload={handleUpload} isUploading={isUploading} />

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search documents..." 
                className="pl-10 w-64" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedCategory !== "All" 
                ? "Try adjusting your search or filter" 
                : "Upload your first document to get started"}
            </p>
          </div>
        )}

        {/* Documents Grid/List */}
        {!isLoading && filteredDocs.length > 0 && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-card transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      {getFileIcon(doc.file_type, doc.document_type)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(doc)}>
                          <FileImage className="w-4 h-4 mr-2" />
                          Preview Document
                        </DropdownMenuItem>
                        {doc.status === "processed" && doc.extracted_data && (
                          <DropdownMenuItem onClick={() => handleViewData(doc)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Extracted Data
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(doc)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h4 className="font-medium text-foreground truncate mb-1">{doc.file_name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                  </p>
                  {getStatusBadge(doc.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Document</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Size</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {getFileIcon(doc.file_type, doc.document_type)}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[200px]">{doc.file_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell capitalize">
                        {doc.document_type.replace("_", " ")}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(doc)}>
                              <FileImage className="w-4 h-4 mr-2" />
                              Preview Document
                            </DropdownMenuItem>
                            {doc.status === "processed" && doc.extracted_data && (
                              <DropdownMenuItem onClick={() => handleViewData(doc)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Extracted Data
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDelete(doc)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Extracted Data Modal */}
      {selectedDocument && (
        <ExtractedDataView
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          fileName={selectedDocument.file_name}
          data={selectedDocument.extracted_data}
        />
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          fileName={previewDocument.file_name}
          filePath={previewDocument.file_path}
          fileType={previewDocument.file_type}
        />
      )}

      {/* Manual Entry Dialog */}
      <ManualEntryDialog
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Documents;
