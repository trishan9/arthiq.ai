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

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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
    if (lowerName.includes("bank") || lowerName.includes("statement")) return "bank_statement";
    if (lowerName.includes("invoice") || lowerName.includes("bill")) return "invoice";
    if (lowerName.includes("receipt")) return "receipt";
    if (lowerName.includes("vat") || lowerName.includes("tax")) return "tax_document";
    if (lowerName.includes("salary") || lowerName.includes("payroll")) return "payroll";
    return "other";
  };

  const uploadDocument = async (file: File): Promise<Document | null> => {
    setIsUploading(true);
    try {
      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const documentType = detectDocumentType(file.name);

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: filePath,
          document_type: documentType,
          status: "pending",
        })
        .select()
        .single();

      if (docError) throw docError;

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded. Processing will begin shortly.`,
      });

      // Trigger OCR processing
      processDocument(docData.id, urlData.publicUrl, documentType);

      // Refresh documents list
      await fetchDocuments();

      return docData as Document;
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const processDocument = async (documentId: string, fileUrl: string, documentType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("process-document", {
        body: { documentId, fileUrl, documentType },
      });

      if (error) {
        console.error("Processing error:", error);
        toast({
          title: "Processing Error",
          description: "Failed to process document with OCR.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Processing Complete",
          description: "Document has been processed successfully.",
        });
        // Refresh to get updated status
        await fetchDocuments();
      }
    } catch (error) {
      console.error("Error invoking process function:", error);
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from("documents").remove([filePath]);

      // Delete from database
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
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
}
