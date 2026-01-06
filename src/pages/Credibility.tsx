import { useState } from "react";
import {
  Loader2,
  ArrowRight,
  Lock,
  Building2,
  Send,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useCredibilityScore } from "@/hooks/use-credibility-score";
import { useVerificationProofs } from "@/hooks/useVerificationProofs";

import { CredibilityOverview } from "@/components/credibility/CredibilityOverviewCard";
import { EvidenceHealthCard } from "@/components/credibility/EvidenceHealthCard";
import { StabilityGrowthCard } from "@/components/credibility/StabilityGrowthCard";
import { ComplianceReadinessCard } from "@/components/credibility/ComplianceReadinessCard";
import { ActionPlanCard } from "@/components/credibility/ActionPlanCard";
import { AnomalyAlertsCard } from "@/components/credibility/AnomalyAlertsCard";
import { TrustTierCard } from "@/components/credibility/TrustTierCard";
import { IssuedCredentials } from "@/components/credibility/IssuedCredentials";
import {
  CredentialTemplates,
  credentialTemplates,
} from "@/components/credibility/CredentialTemplates";
import {
  VerifiableClaims,
  VerifiableClaim,
} from "@/components/credibility/VerifiableClaims";
import { CredentialPreview } from "@/components/credibility/CredentialPreview";

const Credibility = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [credentialName, setCredentialName] = useState("");
  const [sharedWith, setSharedWith] = useState("");
  const [sharedWithEmail, setSharedWithEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);

  const { credibilityScore, isLoading, hasData, metrics } =
    useCredibilityScore();
  const {
    proofs,
    isGenerating,
    generateProof,
    revokeProof,
    copyVerificationLink,
    viewOnBlockchain,
  } = useVerificationProofs();

  const netProfit = metrics.totalRevenue - metrics.totalExpenses;
  const profitMargin =
    metrics.totalRevenue > 0 ? (netProfit / metrics.totalRevenue) * 100 : 0;

  // Generate verifiable claims based on actual financial data
  const availableClaims: VerifiableClaim[] = [
    {
      id: "credibility_score",
      name: "Credibility Score Verified",
      description: "Overall credibility assessment",
      claim:
        credibilityScore.totalScore >= 70
          ? `Credibility Score: ${credibilityScore.totalScore}/100 (${credibilityScore.trustTier.label})`
          : `Credibility Score: ${credibilityScore.totalScore}/100`,
      privateData: `Detailed breakdown: Evidence ${credibilityScore.evidenceQuality.score}, Stability ${credibilityScore.stabilityGrowth.score}, Compliance ${credibilityScore.complianceReadiness.score}`,
      isVerified: hasData && credibilityScore.totalScore > 0,
      value: credibilityScore.totalScore,
    },
    {
      id: "trust_tier",
      name: "Trust Tier Level",
      description: "Verification tier achieved",
      claim: `Trust Tier ${credibilityScore.trustTier.tier}: ${credibilityScore.trustTier.label}`,
      privateData: `Requirements: ${credibilityScore.trustTier.requirements.join(
        ", "
      )}`,
      isVerified: hasData,
      value: credibilityScore.trustTier.tier,
    },
    {
      id: "revenue_verified",
      name: "Revenue Verified",
      description: "Confirms revenue documentation",
      claim:
        metrics.totalRevenue >= 5000000
          ? "Annual revenue exceeds NPR 50 Lakhs"
          : metrics.totalRevenue >= 1000000
          ? "Annual revenue exceeds NPR 10 Lakhs"
          : "Revenue documentation verified",
      privateData: `Exact amount: NPR ${metrics.totalRevenue.toLocaleString()}`,
      isVerified: hasData && metrics.totalRevenue > 0,
      value: metrics.totalRevenue,
    },
    {
      id: "profitable_business",
      name: "Profitable Business",
      description: "Confirms positive profit margins",
      claim:
        netProfit > 0
          ? `Business is profitable with ${
              profitMargin >= 20
                ? "healthy"
                : profitMargin >= 10
                ? "positive"
                : "slim"
            } margins`
          : "Profit status documented",
      privateData: `Net profit: NPR ${netProfit.toLocaleString()}, Margin: ${profitMargin.toFixed(
        1
      )}%`,
      isVerified: hasData && netProfit > 0,
      value: netProfit,
    },
    {
      id: "compliance_status",
      name: "Compliance Verified",
      description: "Nepal regulatory compliance",
      claim:
        credibilityScore.complianceReadiness.score >= 70
          ? "Compliant with Nepal financial regulations"
          : "Compliance documentation available",
      privateData: `Compliance score: ${credibilityScore.complianceReadiness.score}/100`,
      isVerified: credibilityScore.complianceReadiness.score >= 50,
      value: credibilityScore.complianceReadiness.score,
    },
    {
      id: "data_integrity",
      name: "Data Integrity Verified",
      description: "Anti-fraud checks passed",
      claim:
        credibilityScore.anomalies.length === 0 &&
        credibilityScore.crossSourceReconciliation.passed
          ? "All anti-fraud checks passed"
          : "Data integrity verified with noted exceptions",
      privateData: `Anomalies: ${credibilityScore.anomalies.length}, Reconciliation: ${credibilityScore.crossSourceReconciliation.reconciliationScore}%`,
      isVerified:
        credibilityScore.anomalies.length === 0 &&
        credibilityScore.crossSourceReconciliation.passed,
      value: credibilityScore.crossSourceReconciliation.reconciliationScore,
    },
  ];

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = credentialTemplates.find((t) => t.id === templateId);
    if (template) {
      const verifiedClaims = availableClaims
        .filter((c) => c.isVerified)
        .map((c) => c.id)
        .slice(0, 4);
      setSelectedClaims(verifiedClaims);
      setCredentialName(template.name);
    }
  };

  const toggleClaim = (claimId: string) => {
    setSelectedClaims((prev) =>
      prev.includes(claimId)
        ? prev.filter((id) => id !== claimId)
        : [...prev, claimId]
    );
  };

  const handleIssueCredential = async () => {
    if (!credentialName.trim() || selectedClaims.length === 0) return;

    const includedData = selectedClaims.map((id) => {
      const claim = availableClaims.find((c) => c.id === id);
      return { id, name: claim?.name || id };
    });

    const financialMetrics = {
      credibilityScore: credibilityScore.totalScore,
      trustTier: credibilityScore.trustTier.tier,
      evidenceQuality: credibilityScore.evidenceQuality.score,
      stabilityGrowth: credibilityScore.stabilityGrowth.score,
      complianceReadiness: credibilityScore.complianceReadiness.score,
      confidenceLevel: credibilityScore.confidenceLevel,
      totalRevenue: metrics.totalRevenue,
      totalExpenses: metrics.totalExpenses,
      netProfit,
      profitMargin,
      verifiedClaims: selectedClaims.map((id) => {
        const claim = availableClaims.find((c) => c.id === id);
        return { id, claim: claim?.claim };
      }),
    };

    const proof = await generateProof(
      credentialName,
      includedData,
      financialMetrics,
      sharedWith || undefined,
      sharedWithEmail || undefined,
      expiresInDays
    );

    if (proof) {
      setCredentialName("");
      setSharedWith("");
      setSharedWithEmail("");
      setExpiresInDays(30);
      setSelectedClaims([]);
      setSelectedTemplate(null);
      setIsDialogOpen(false);
    }
  };

  const previewClaims = selectedClaims.map((id) => {
    const claim = availableClaims.find((c) => c.id === id);
    return {
      id,
      name: claim?.name || id,
      claim: claim?.claim || "",
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Credibility Center"
        subtitle="Everything here builds your lender-ready credibility score"
        showSearch={false}
      />

      <div className="p-6 space-y-6">
        {/* Credibility Overview Hero */}
        <CredibilityOverview score={credibilityScore} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Score Breakdown</TabsTrigger>
            <TabsTrigger value="credentials">Issue Credentials</TabsTrigger>
            <TabsTrigger value="history">Issued History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Action Plan - Top Priority */}
            <ActionPlanCard actions={credibilityScore.improvementActions} />

            {/* Score Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EvidenceHealthCard evidence={credibilityScore.evidenceQuality} />
              <StabilityGrowthCard
                stability={credibilityScore.stabilityGrowth}
              />
              <ComplianceReadinessCard
                compliance={credibilityScore.complianceReadiness}
              />
            </div>

            {/* Anti-Fraud & Trust Tier */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnomalyAlertsCard
                anomalies={credibilityScore.anomalies}
                reconciliation={credibilityScore.crossSourceReconciliation}
              />
              <TrustTierCard currentTier={credibilityScore.trustTier} />
            </div>
          </TabsContent>

          {/* Issue Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6 mt-6">
            {/* Info Banner about Verification Flow */}
            <Alert className="bg-blue-50 border-blue-200">
              <FileCheck className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>How verification works:</strong> Create a self-attested
                credential here, then apply to lenders in the Marketplace. When
                a lender verifies your data, it gets stored on blockchain and
                your Trust Tier is upgraded.
              </AlertDescription>
            </Alert>

            {!hasData ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  No Financial Data Yet
                </h4>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Upload invoices, bank statements, or other financial documents
                  to verify your business and issue credentials.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/documents")}
                >
                  Go to Documents
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Template & Claims */}
                <div className="space-y-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      Choose Purpose
                    </h4>
                    <CredentialTemplates
                      selectedTemplate={selectedTemplate}
                      onSelectTemplate={handleSelectTemplate}
                    />
                  </div>

                  {selectedTemplate && (
                    <div className="bg-card rounded-xl border border-border p-6">
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                          2
                        </span>
                        Select Claims to Include
                      </h4>
                      <VerifiableClaims
                        claims={availableClaims}
                        selectedClaims={selectedClaims}
                        onToggleClaim={toggleClaim}
                        showPrivacyComparison
                      />
                    </div>
                  )}
                </div>

                {/* Right: Preview */}
                <div className="space-y-6">
                  {selectedClaims.length > 0 && (
                    <>
                      <CredentialPreview
                        proofName={credentialName || "New Credential"}
                        claims={previewClaims}
                        expiresAt={
                          new Date(
                            Date.now() + expiresInDays * 24 * 60 * 60 * 1000
                          )
                        }
                        credibilityScore={credibilityScore.totalScore}
                        sharedWith={sharedWith}
                      />
                      <div className="space-y-3">
                        <Button
                          variant="accent"
                          size="lg"
                          className="w-full"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          <FileCheck className="w-4 h-4 mr-2" />
                          Create Self-Attested Credential
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          This creates a local credential. To get blockchain
                          verification, apply to a lender.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Request Verification CTA */}
                  {selectedClaims.length > 0 && (
                    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-6">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        🔗 Want Blockchain Verification?
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Apply to a lender in the Marketplace. When they verify
                        your credibility packet, your data is permanently stored
                        on blockchain and your Trust Tier is upgraded.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full border-emerald-300 hover:bg-emerald-100"
                        onClick={() => navigate("/dashboard/marketplace")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Go to Lender Marketplace
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <IssuedCredentials
              credentials={proofs}
              onRevoke={revokeProof}
              onCopyLink={copyVerificationLink}
              onViewBlockchain={viewOnBlockchain}
            />
          </TabsContent>
        </Tabs>

        {/* Credential Issue Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Self-Attested Credential</DialogTitle>
              <DialogDescription>
                This creates a local credential for your records. To get
                blockchain-verified, apply to a lender who will verify your
                data.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="credentialName">Credential Name *</Label>
                <Input
                  id="credentialName"
                  placeholder="e.g., Himalayan Bank Loan Application"
                  value={credentialName}
                  onChange={(e) => setCredentialName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sharedWith" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Recipient Organization
                </Label>
                <Input
                  id="sharedWith"
                  placeholder="e.g., Himalayan Bank Ltd"
                  value={sharedWith}
                  onChange={(e) => setSharedWith(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="sharedWithEmail"
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Recipient Email (Optional)
                </Label>
                <Input
                  id="sharedWithEmail"
                  type="email"
                  placeholder="e.g., loans@himalayanbank.com"
                  value={sharedWithEmail}
                  onChange={(e) => setSharedWithEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresIn">Valid For (Days)</Label>
                <Input
                  id="expiresIn"
                  type="number"
                  min={1}
                  max={365}
                  value={expiresInDays}
                  onChange={(e) =>
                    setExpiresInDays(parseInt(e.target.value) || 30)
                  }
                />
              </div>

              <Button
                variant="accent"
                className="w-full"
                onClick={handleIssueCredential}
                disabled={isGenerating || !credentialName.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Create Credential
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Not stored on blockchain. Apply to lenders for verification.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Credibility;
