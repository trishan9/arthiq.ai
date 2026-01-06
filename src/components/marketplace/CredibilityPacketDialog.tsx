import { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  AlertTriangle,
  Loader2,
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CredibilityScore } from "@/hooks/use-credibility-score";
import { FinancialMetrics } from "@/hooks/useFinancialData";
import {
  downloadCredibilityPacket,
  CredibilityPacketConfig,
} from "@/lib/credibilityPacketGenerator";
import { cn } from "@/lib/utils";

interface CredibilityPacketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credibilityScore: CredibilityScore | null;
  metrics: FinancialMetrics | null;
  businessName: string;
  lenderName: string;
  requestType: "loan" | "partnership";
  requestedAmount?: number;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
};

const getTierLabel = (tier: number) => {
  const labels = [
    "Self-Declared",
    "Document-Backed",
    "Bank-Supported",
    "Verified",
  ];
  return labels[tier] || "Unknown";
};

export function CredibilityPacketDialog({
  open,
  onOpenChange,
  credibilityScore,
  metrics,
  businessName,
  lenderName,
  requestType,
  requestedAmount,
}: CredibilityPacketDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!credibilityScore || !metrics) {
    return null;
  }

  const handleDownload = async () => {
    setIsGenerating(true);

    // Simulate a brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const config: CredibilityPacketConfig = {
      businessName,
      businessType: "SME",
      lenderName,
      requestType,
      requestedAmount,
      packetId: `CP-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date(),
    };

    downloadCredibilityPacket(credibilityScore, metrics, config);
    setIsGenerating(false);
  };

  const criticalCount = credibilityScore.anomalies.filter(
    (a) => a.severity === "critical"
  ).length;
  const highCount = credibilityScore.anomalies.filter(
    (a) => a.severity === "high"
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Credibility Packet Preview
          </DialogTitle>
          <DialogDescription>
            Review the credibility packet that will be shared with {lenderName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Score Hero */}
            <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/30 border">
              <div
                className={cn(
                  "w-24 h-24 rounded-xl flex flex-col items-center justify-center",
                  credibilityScore.totalScore >= 80
                    ? "bg-emerald-500/10"
                    : credibilityScore.totalScore >= 60
                    ? "bg-blue-500/10"
                    : credibilityScore.totalScore >= 40
                    ? "bg-amber-500/10"
                    : "bg-red-500/10"
                )}
              >
                <span
                  className={cn(
                    "text-4xl font-bold",
                    getScoreColor(credibilityScore.totalScore)
                  )}
                >
                  {credibilityScore.totalScore}
                </span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Business</p>
                  <p className="font-semibold">{businessName}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Trust Tier</p>
                    <Badge variant="outline">
                      Tier {credibilityScore.trustTier.tier}:{" "}
                      {getTierLabel(credibilityScore.trustTier.tier)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <Badge
                      variant={
                        credibilityScore.confidenceLevel === "high"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {credibilityScore.confidenceLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Evidence Quality",
                  score: credibilityScore.evidenceQuality.score,
                  icon: FileText,
                },
                {
                  label: "Stability & Growth",
                  score: credibilityScore.stabilityGrowth.score,
                  icon: TrendingUp,
                },
                {
                  label: "Compliance",
                  score: credibilityScore.complianceReadiness.score,
                  icon: Shield,
                },
              ].map((item) => (
                <Card key={item.label} className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          getScoreColor(item.score)
                        )}
                      >
                        {Math.round(item.score)}
                      </span>
                      <span className="text-xs text-muted-foreground mb-1">
                        %
                      </span>
                    </div>
                    <Progress value={item.score} className="h-1 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Anti-Fraud Summary */}
            <div
              className={cn(
                "p-3 rounded-lg border",
                criticalCount > 0
                  ? "bg-red-500/5 border-red-500/20"
                  : highCount > 0
                  ? "bg-amber-500/5 border-amber-500/20"
                  : "bg-emerald-500/5 border-emerald-500/20"
              )}
            >
              <div className="flex items-center gap-2">
                {criticalCount === 0 && highCount === 0 ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-sm font-medium">
                  {criticalCount === 0 && highCount === 0
                    ? "No Critical Issues Detected"
                    : `${criticalCount + highCount} Issues Require Attention`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Anti-Fraud Score: {credibilityScore.trustTier.antifraudScore}
                /100
              </p>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Total Revenue",
                  value: `NPR ${metrics.totalRevenue.toLocaleString()}`,
                },
                {
                  label: "Total Expenses",
                  value: `NPR ${metrics.totalExpenses.toLocaleString()}`,
                },
                {
                  label: "Net Profit",
                  value: `NPR ${(
                    metrics.totalRevenue - metrics.totalExpenses
                  ).toLocaleString()}`,
                },
                {
                  label: "VAT Collected",
                  value: `NPR ${metrics.vatCollected.toLocaleString()}`,
                },
                { label: "Documents", value: metrics.documentCount.toString() },
                {
                  label: "Avg Transaction",
                  value: `NPR ${metrics.averageTransactionValue.toLocaleString()}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            {metrics.monthlyData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Monthly Trend (Last 6 Months)
                </h4>
                <div className="space-y-2">
                  {metrics.monthlyData.slice(-6).map((month) => (
                    <div
                      key={month.month}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-16 text-muted-foreground">
                        {month.month}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (month.income /
                                Math.max(
                                  ...metrics.monthlyData.map((m) => m.income)
                                )) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="w-24 text-right font-medium">
                        NPR {month.income.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground">
                  Document Completeness
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold">
                    {Math.round(
                      credibilityScore.complianceReadiness.documentCompleteness
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground">
                  Timeliness Score
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold">
                    {Math.round(
                      credibilityScore.complianceReadiness.timelinessScore
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Cross-Source Verification */}
            <div
              className={cn(
                "p-3 rounded-lg border",
                credibilityScore.crossSourceReconciliation.passed
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Cross-Source Verification
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <p className="font-semibold">
                    {Math.round(
                      credibilityScore.crossSourceReconciliation
                        .reconciliationScore
                    )}
                    %
                  </p>
                  <p className="text-muted-foreground">Reconciliation Score</p>
                </div>
                <div>
                  <p className="font-semibold">
                    {
                      credibilityScore.crossSourceReconciliation.mismatches
                        .length
                    }
                  </p>
                  <p className="text-muted-foreground">Mismatches</p>
                </div>
              </div>
            </div>

            {/* Issues List */}
            {credibilityScore.anomalies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Detected Issues ({credibilityScore.anomalies.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {credibilityScore.anomalies.slice(0, 5).map((anomaly, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          anomaly.severity === "critical" &&
                            "text-red-500 border-red-500/30",
                          anomaly.severity === "high" &&
                            "text-amber-500 border-amber-500/30",
                          anomaly.severity === "medium" &&
                            "text-blue-500 border-blue-500/30"
                        )}
                      >
                        {anomaly.severity}
                      </Badge>
                      <span className="truncate">{anomaly.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="text-xs text-muted-foreground">
          <Clock className="h-3 w-3 inline mr-1" />
          This packet will be valid for 30 days from generation date.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
