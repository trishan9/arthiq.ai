import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VerificationProof {
  id: string;
  proof_name: string;
  proof_hash: string;
  tx_hash: string | null;
  blockchain_network: string | null;
  included_data: { id: string; name: string }[];
  shared_with: string | null;
  shared_with_email: string | null;
  expires_at: string;
  status: string;
  verification_url: string | null;
  verification_type: "self-attested" | "lender-verified";
  verified_by_lender_id: string | null;
  verifier_name: string | null;
  verifier_notes: string | null;
  marketplace_request_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationItem {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export function useVerificationProofs() {
  const [proofs, setProofs] = useState<VerificationProof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchProofs = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "blockchain-verify",
        {
          body: { action: "list-proofs" },
        }
      );

      if (error) throw error;
      setProofs(data.proofs || []);
    } catch (error) {
      console.error("Error fetching proofs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch verification proofs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProofs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("verification_proofs_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verification_proofs",
        },
        () => {
          fetchProofs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProofs]);

  const generateProof = async (
    proofName: string,
    includedData: { id: string; name: string }[],
    financialMetrics: Record<string, unknown>,
    sharedWith?: string,
    sharedWithEmail?: string,
    expiresInDays?: number
  ): Promise<VerificationProof | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "blockchain-verify",
        {
          body: {
            action: "generate-proof",
            proofName,
            includedData,
            financialMetrics,
            sharedWith,
            sharedWithEmail,
            expiresInDays,
          },
        }
      );

      if (error) throw error;

      toast({
        title: "Proof Generated",
        description:
          "Your verification proof has been created and stored on the blockchain",
      });

      await fetchProofs();
      return data.proof;
    } catch (error) {
      console.error("Error generating proof:", error);
      toast({
        title: "Error",
        description: "Failed to generate verification proof",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeProof = async (proofId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke("blockchain-verify", {
        body: {
          action: "revoke-proof",
          proofId,
        },
      });

      if (error) throw error;

      toast({
        title: "Proof Revoked",
        description: "The verification proof has been revoked",
      });

      await fetchProofs();
      return true;
    } catch (error) {
      console.error("Error revoking proof:", error);
      toast({
        title: "Error",
        description: "Failed to revoke proof",
        variant: "destructive",
      });
      return false;
    }
  };

  const copyVerificationLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Verification link copied to clipboard",
    });
  };

  const viewOnBlockchain = (txHash: string) => {
    // Sepolia testnet explorer (Etherscan)
    const explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
    window.open(explorerUrl, "_blank");
  };

  return {
    proofs,
    isLoading,
    isGenerating,
    generateProof,
    revokeProof,
    copyVerificationLink,
    viewOnBlockchain,
    refetch: fetchProofs,
  };
}
