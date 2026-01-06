import {
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  TrendingUp,
  Shield,
  AlertTriangle,
  Banknote,
  Send,
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
import {
  Lender,
  EligibilityCriteria,
  SMEProfile,
} from "@/hooks/use-market-place";
import { cn } from "@/lib/utils";

interface EligibilityDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lender: Lender | null;
  criteria: EligibilityCriteria | null;
  currentSME?: SMEProfile;
  eligibilityResult?: {
    eligible: boolean;
    matchPercentage: number;
    missingRequirements: string[];
  };
  onApply?: () => void;
  onViewLeaderboard?: () => void;
}

export function EligibilityDetailDialog({
  open,
  onOpenChange,
  lender,
  criteria,
  currentSME,
  eligibilityResult,
  onApply,
  onViewLeaderboard,
}: EligibilityDetailDialogProps) {
  if (!lender || !criteria) return null;

  const documentTypeLabels: Record<string, string> = {
    bank_statement: "Bank Statement",
    vat_return: "VAT Return",
    audit_report: "Audit Report",
    invoice: "Invoice",
    sales_record: "Sales Record",
    business_plan: "Business Plan",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {criteria.name}
            {eligibilityResult?.eligible && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Eligible
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>by {lender.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {criteria.description && (
            <p className="text-sm text-muted-foreground">
              {criteria.description}
            </p>
          )}

          {/* Eligibility Match */}
          {eligibilityResult && (
            <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Your Eligibility Match</span>
                <span
                  className={cn(
                    "font-bold",
                    eligibilityResult.eligible
                      ? "text-emerald-500"
                      : "text-amber-500"
                  )}
                >
                  {eligibilityResult.matchPercentage}%
                </span>
              </div>
              <Progress
                value={eligibilityResult.matchPercentage}
                className={cn(
                  "h-2",
                  eligibilityResult.eligible
                    ? "[&>div]:bg-emerald-500"
                    : "[&>div]:bg-amber-500"
                )}
              />
              {eligibilityResult.missingRequirements.length > 0 && (
                <div className="pt-2 space-y-1">
                  <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Missing Requirements:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {eligibilityResult.missingRequirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Requirements Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Shield className="h-4 w-4 text-primary" />
                Credibility Score
              </div>
              <p className="text-2xl font-bold">
                ≥ {criteria.min_credibility_score}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trust Tier
              </div>
              <p className="text-2xl font-bold">≥ {criteria.min_trust_tier}</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Banknote className="h-4 w-4 text-primary" />
                Min. Revenue
              </div>
              <p className="text-lg font-bold">
                NPR {criteria.min_monthly_revenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                Business Age
              </div>
              <p className="text-2xl font-bold">
                ≥ {criteria.min_business_age_months}
              </p>
              <p className="text-xs text-muted-foreground">months</p>
            </div>
          </div>

          {/* Required Documents */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-primary" />
              Required Documents
            </div>
            <div className="flex flex-wrap gap-1.5">
              {criteria.required_document_types.map((docType) => (
                <Badge key={docType} variant="secondary" className="text-xs">
                  {documentTypeLabels[docType] || docType}
                </Badge>
              ))}
            </div>
          </div>

          {/* Anomaly Limit */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Maximum Anomalies Allowed</span>
            </div>
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-500/30"
            >
              {criteria.max_anomaly_count}
            </Badge>
          </div>

          {/* Custom Requirements */}
          {Object.keys(criteria.custom_requirements).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Additional Requirements</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(criteria.custom_requirements).map(
                  ([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key.replace(/_/g, " ")}: {String(value)}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {onViewLeaderboard && (
            <Button variant="outline" onClick={onViewLeaderboard}>
              View Leaderboard
            </Button>
          )}
          {onApply && eligibilityResult?.eligible && (
            <Button onClick={onApply}>
              <Send className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
