import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  document_type: string;
  status: string;
  extracted_data: Json | null;
  created_at: string;
  updated_at: string;
}

export interface PendingDocument {
  id: string;
  file: File;
  extractedData: Json | null;
  documentType: string;
  status: "processing" | "ready" | "error";
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [pendingDocument, setPendingDocument] =
    useState<PendingDocument | null>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments((data as Document[]) || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const detectDocumentType = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes("bank") || lowerName.includes("statement"))
      return "bank_statement";
    if (lowerName.includes("invoice") || lowerName.includes("bill"))
      return "invoice";
    if (lowerName.includes("receipt")) return "receipt";
    if (lowerName.includes("vat") || lowerName.includes("tax"))
      return "tax_document";
    if (lowerName.includes("salary") || lowerName.includes("payroll"))
      return "payroll";
    if (
      lowerName.includes("profit") ||
      lowerName.includes("loss") ||
      lowerName.includes("p&l") ||
      lowerName.includes("pl")
    )
      return "profit_loss";
    if (lowerName.includes("balance") || lowerName.includes("sheet"))
      return "balance_sheet";
    return "other";
  };

  // Upload file and process with AI, but don't save yet - return extracted data for review
  const uploadAndProcess = async (file: File): Promise<void> => {
    setIsUploading(true);
    const tempId = `temp-${Date.now()}`;

    try {
      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const documentType = detectDocumentType(file.name);

      setPendingDocument({
        id: tempId,
        file,
        extractedData: null,
        documentType,
        status: "processing",
      });

      toast({
        title: "Processing Document",
        description: "AI is extracting data from your document...",
      });

      // Call AI to process document
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "process-document",
        {
          body: {
            documentId: tempId,
            fileUrl: urlData.publicUrl,
            documentType,
            returnOnly: true, // Don't save to DB, just return extracted data
          },
        }
      );

      if (aiError) {
        console.error("AI processing error:", aiError);
        setPendingDocument((prev) =>
          prev ? { ...prev, status: "error" } : null
        );
        toast({
          title: "Processing Error",
          description:
            "Failed to extract data. You can still save with manual edits.",
          variant: "destructive",
        });
        return;
      }

      setPendingDocument({
        id: tempId,
        file,
        extractedData: aiData?.extractedData || null,
        documentType: aiData?.documentType || documentType,
        status: "ready",
      });

      toast({
        title: "Review Required",
        description: "Please review the extracted data before saving.",
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      setPendingDocument(null);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDocument = async (
    extractedData: Json
  ): Promise<Document | null> => {
    if (!pendingDocument) return null;

    try {
      const file = pendingDocument.file;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Create document record with confirmed data
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: filePath,
          document_type:
            (extractedData as any)?.type || pendingDocument.documentType,
          status: "processed",
          extracted_data: extractedData,
        })
        .select()
        .single();

      if (docError) throw docError;

      toast({
        title: "Document Saved",
        description: `${file.name} has been saved successfully.`,
      });

      setPendingDocument(null);
      await fetchDocuments();

      return docData as Document;
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save document. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const cancelPendingDocument = () => {
    setPendingDocument(null);
  };

  // Legacy upload method (for manual entries that don't need AI)
  const uploadDocument = async (file: File): Promise<Document | null> => {
    await uploadAndProcess(file);
    return null; // Now returns via confirmation flow
  };

  const updateExtractedData = async (
    documentId: string,
    extractedData: Json
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({
          extracted_data: extractedData,
          document_type: (extractedData as any)?.type || "other",
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      if (error) throw error;

      toast({
        title: "Document Updated",
        description: "Extracted data has been updated successfully.",
      });

      await fetchDocuments();
      return true;
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update document.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      if (!filePath.startsWith("sample/")) {
        await supabase.storage.from("documents").remove([filePath]);
      }

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      toast({
        title: "Document Deleted",
        description: "Document has been removed.",
      });

      await fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  return {
    documents,
    isLoading,
    isUploading,
    isSeeding,
    pendingDocument,
    uploadDocument,
    uploadAndProcess,
    confirmDocument,
    cancelPendingDocument,
    updateExtractedData,
    deleteDocument,
    refetch: fetchDocuments,
  };
}
