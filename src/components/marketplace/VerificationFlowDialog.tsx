import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  Shield,
  AlertTriangle,
  User,
  Loader2,
  ExternalLink,
  Link2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  MarketplaceRequest,
  SMEProfile,
  Lender,
} from "@/hooks/use-market-place";
import { CredibilityScore } from "@/hooks/use-credibility-score";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerificationFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MarketplaceRequest | null;
  smeProfile: SMEProfile | null;
  credibilityScore: CredibilityScore | null;
  lender: Lender | null;
  onApprove: (response: string) => Promise<void>;
  onReject: (response: string) => Promise<void>;
  onViewPacket: () => void;
}

const getTierLabel = (tier: number) => {
  const labels = [
    "Self-Declared",
    "Document-Backed",
    "Lender-Verified",
    "Fully Verified",
  ];
  return labels[tier] || "Unknown";
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
};

export function VerificationFlowDialog({
  open,
  onOpenChange,
  request,
  smeProfile,
  credibilityScore,
  lender,
  onApprove,
  onReject,
  onViewPacket,
}: VerificationFlowDialogProps) {
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockchainProof, setBlockchainProof] = useState<{
    txHash: string;
    proofId: string;
  } | null>(null);
  const { toast } = useToast();

  const [verificationChecks, setVerificationChecks] = useState({
    reviewedFinancials: false,
    verifiedDocuments: false,
    assessedRisk: false,
    confirmedCompliance: false,
  });

  const allChecksCompleted = Object.values(verificationChecks).every(Boolean);

  // Lender approves → triggers blockchain verification
  const handleApprove = async () => {
    if (!allChecksCompleted || !request || !smeProfile || !lender) return;
    setIsSubmitting(true);

    try {
      // Call blockchain-verify with lender-verify action
      const { data, error } = await supabase.functions.invoke(
        "blockchain-verify",
        {
          body: {
            action: "lender-verify",
            requestId: request.id,
            lenderId: lender.id,
            lenderName: lender.name,
            smeId: smeProfile.id,
            smeData: {
              businessName: smeProfile.business_name,
              businessType: smeProfile.business_type,
            },
            verifierNotes: response,
            financialMetrics: {
              credibilityScore: credibilityScore?.totalScore || 0,
              trustTier: credibilityScore?.trustTier.tier || 0,
              evidenceQuality: credibilityScore?.evidenceQuality.score || 0,
              complianceScore: credibilityScore?.complianceReadiness.score || 0,
              totalRevenue: 0, // Would come from actual financial data
            },
          },
        }
      );

      if (error) throw error;

      // Store blockchain proof details
      setBlockchainProof({
        txHash: data.txHash,
        proofId: data.proof?.id,
      });

      toast({
        title: "✓ Verification Stored on Blockchain",
        description: `Transaction: ${data.txHash?.slice(
          0,
          10
        )}...${data.txHash?.slice(-6)}`,
      });

      // Call the parent approve handler
      await onApprove(response);
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Could not store verification on blockchain",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(response);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewOnBlockchain = (txHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank");
  };

  if (!request || !smeProfile) return null;

  const criticalCount =
    credibilityScore?.anomalies.filter((a) => a.severity === "critical")
      .length || 0;
  const highCount =
    credibilityScore?.anomalies.filter((a) => a.severity === "high").length ||
    0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Lender Verification Flow
          </DialogTitle>
          <DialogDescription>
            Review and verify {smeProfile.business_name}'s credibility packet.
            Approval stores verification on blockchain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Blockchain Verification Status */}
          {blockchainProof && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-emerald-700">
                  Verified on Blockchain
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                This SME's credibility is now permanently recorded on Sepolia
                blockchain.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewOnBlockchain(blockchainProof.txHash)}
              >
                View Transaction
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          )}

          {/* SME Summary */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{smeProfile.business_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {smeProfile.business_type}
                  </p>
                </div>
              </div>
              {credibilityScore && (
                <div className="text-right">
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      getScoreColor(credibilityScore.totalScore)
                    )}
                  >
                    {credibilityScore.totalScore}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Credibility Score
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 rounded bg-background">
                <p className="text-lg font-semibold">{smeProfile.trust_tier}</p>
                <p className="text-xs text-muted-foreground">
                  {getTierLabel(smeProfile.trust_tier)}
                </p>
              </div>
              <div className="text-center p-2 rounded bg-background">
                <p className="text-lg font-semibold">
                  {smeProfile.total_documents}
                </p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
              <div className="text-center p-2 rounded bg-background">
                <p className="text-lg font-semibold">
                  {smeProfile.anomaly_count}
                </p>
                <p className="text-xs text-muted-foreground">Flags</p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Request Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Type:</span>{" "}
                <span className="font-medium capitalize">
                  {request.request_type}
                </span>
              </div>
              {request.amount_requested && (
                <div className="p-2 rounded bg-muted/30">
                  <span className="text-muted-foreground">Amount:</span>{" "}
                  <span className="font-medium">
                    NPR {request.amount_requested.toLocaleString()}
                  </span>
                </div>
              )}
              {request.purpose && (
                <div className="p-2 rounded bg-muted/30 col-span-2">
                  <span className="text-muted-foreground">Purpose:</span>{" "}
                  <span className="font-medium">{request.purpose}</span>
                </div>
              )}
            </div>
            {request.message && (
              <div className="p-3 rounded bg-muted/20 border border-border/50 text-sm italic">
                "{request.message}"
              </div>
            )}
          </div>

          {/* Risk Assessment */}
          {credibilityScore && (
            <div
              className={cn(
                "p-3 rounded-lg border",
                criticalCount > 0
                  ? "bg-red-500/5 border-red-500/30"
                  : highCount > 0
                  ? "bg-amber-500/5 border-amber-500/30"
                  : "bg-emerald-500/5 border-emerald-500/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={cn(
                      "h-4 w-4",
                      criticalCount > 0
                        ? "text-red-500"
                        : highCount > 0
                        ? "text-amber-500"
                        : "text-emerald-500"
                    )}
                  />
                  <span className="text-sm font-medium">Risk Assessment</span>
                </div>
                <Badge variant="outline">
                  Anti-Fraud: {credibilityScore.trustTier.antifraudScore}/100
                </Badge>
              </div>

              {criticalCount > 0 || highCount > 0 ? (
                <div className="text-xs text-muted-foreground">
                  <span className="text-red-500 font-medium">
                    {criticalCount} critical
                  </span>
                  {" and "}
                  <span className="text-amber-500 font-medium">
                    {highCount} high
                  </span>
                  {
                    " priority issues detected. Review carefully before verification."
                  }
                </div>
              ) : (
                <p className="text-xs text-emerald-600">
                  No critical issues detected. Low risk profile.
                </p>
              )}
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onViewPacket}>
            <FileText className="h-4 w-4 mr-2" />
            View Full Credibility Packet
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>

          <Separator />

          {/* Verification Checklist */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Verification Checklist</h4>
            <p className="text-xs text-muted-foreground">
              Complete all checks to verify. Approval stores proof on
              blockchain.
            </p>

            <div className="space-y-2">
              {[
                {
                  id: "reviewedFinancials",
                  label: "Reviewed financial summary and trends",
                },
                {
                  id: "verifiedDocuments",
                  label: "Verified document authenticity and completeness",
                },
                {
                  id: "assessedRisk",
                  label: "Assessed risk profile and anomalies",
                },
                {
                  id: "confirmedCompliance",
                  label: "Confirmed compliance with eligibility criteria",
                },
              ].map((check) => (
                <div
                  key={check.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/30"
                >
                  <Checkbox
                    id={check.id}
                    checked={
                      verificationChecks[
                        check.id as keyof typeof verificationChecks
                      ]
                    }
                    onCheckedChange={(checked) =>
                      setVerificationChecks((prev) => ({
                        ...prev,
                        [check.id]: !!checked,
                      }))
                    }
                    disabled={isSubmitting || !!blockchainProof}
                  />
                  <Label
                    htmlFor={check.id}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {check.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Progress
                value={
                  Object.values(verificationChecks).filter(Boolean).length * 25
                }
                className="flex-1 h-2"
              />
              <span className="text-xs text-muted-foreground">
                {Object.values(verificationChecks).filter(Boolean).length}/4
              </span>
            </div>
          </div>

          {/* Response Message */}
          <div className="space-y-2">
            <Label htmlFor="response">Verification Notes (Optional)</Label>
            <Textarea
              id="response"
              placeholder="Add notes about your verification decision..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
              disabled={isSubmitting || !!blockchainProof}
            />
          </div>

          {/* Blockchain Info */}
          {!blockchainProof && allChecksCompleted && (
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700">
                  Blockchain Verification
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Clicking "Verify & Store" will create a permanent, tamper-proof
                record of this verification on the Sepolia blockchain. The SME's
                trust tier will be upgraded to Tier 2.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!blockchainProof ? (
            <>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isSubmitting || !allChecksCompleted}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Storing on Blockchain...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Verify & Store on Blockchain
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
