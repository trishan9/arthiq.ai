import {
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle,
  Shield,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnomalyAlert } from "@/hooks/use-credibility-score";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AnomalyAlertsCardProps {
  anomalies: AnomalyAlert[];
  reconciliation: {
    passed: boolean;
    mismatches: string[];
    reconciliationScore: number;
  };
}

const severityConfig = {
  critical: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    label: "Critical",
    icon: XCircle,
  },
  high: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    label: "High",
    icon: AlertTriangle,
  },
  medium: {
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    label: "Medium",
    icon: AlertTriangle,
  },
  low: {
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
    label: "Low",
    icon: Info,
  },
};

const categoryConfig = {
  behavioral: { label: "Behavioral", color: "text-accent" },
  data_quality: { label: "Data Quality", color: "text-info" },
  cross_validation: { label: "Cross-Validation", color: "text-warning" },
  timing: { label: "Timing", color: "text-primary" },
};

export function AnomalyAlertsCard({
  anomalies,
  reconciliation,
}: AnomalyAlertsCardProps) {
  const [expandedAnomalies, setExpandedAnomalies] = useState<Set<number>>(
    new Set()
  );

  const criticalCount = anomalies.filter(
    (a) => a.severity === "critical"
  ).length;
  const highCount = anomalies.filter((a) => a.severity === "high").length;
  const mediumCount = anomalies.filter((a) => a.severity === "medium").length;
  const lowCount = anomalies.filter((a) => a.severity === "low").length;

  const hasIssues = anomalies.length > 0 || !reconciliation.passed;
  const hasCritical = criticalCount > 0;
  const hasHigh = highCount > 0;

  const toggleAnomaly = (index: number) => {
    const newSet = new Set(expandedAnomalies);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedAnomalies(newSet);
  };

  // Group anomalies by category
  const groupedAnomalies = anomalies.reduce((acc, anomaly) => {
    const category = anomaly.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(anomaly);
    return acc;
  }, {} as Record<string, AnomalyAlert[]>);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                hasCritical
                  ? "bg-destructive/10"
                  : hasHigh
                  ? "bg-destructive/10"
                  : hasIssues
                  ? "bg-warning/10"
                  : "bg-success/10"
              }`}
            >
              {hasCritical || hasHigh ? (
                <ShieldAlert
                  className={`w-5 h-5 ${
                    hasCritical ? "text-destructive" : "text-warning"
                  }`}
                />
              ) : hasIssues ? (
                <Shield className="w-5 h-5 text-warning" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Anti-Fraud Check</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enhanced anomaly detection & reconciliation
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {hasCritical ? (
              <Badge variant="destructive">{criticalCount} Critical</Badge>
            ) : hasHigh ? (
              <Badge
                variant="outline"
                className="text-destructive bg-destructive/10"
              >
                {highCount} High Risk
              </Badge>
            ) : hasIssues ? (
              <Badge variant="outline" className="text-warning bg-warning/10">
                {anomalies.length + reconciliation.mismatches.length} Issues
              </Badge>
            ) : (
              <Badge variant="outline" className="text-success bg-success/10">
                All Clear
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        {anomalies.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {criticalCount > 0 && (
              <Badge
                variant="outline"
                className="text-destructive bg-destructive/10"
              >
                {criticalCount} Critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge
                variant="outline"
                className="text-destructive bg-destructive/10"
              >
                {highCount} High
              </Badge>
            )}
            {mediumCount > 0 && (
              <Badge variant="outline" className="text-warning bg-warning/10">
                {mediumCount} Medium
              </Badge>
            )}
            {lowCount > 0 && (
              <Badge variant="outline" className="text-info bg-info/10">
                {lowCount} Low
              </Badge>
            )}
          </div>
        )}

        {/* Cross-Source Reconciliation */}
        <div
          className={`p-3 rounded-lg border ${
            reconciliation.passed
              ? "bg-success/5 border-success/20"
              : "bg-warning/5 border-warning/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {reconciliation.passed ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-warning" />
            )}
            <span className="text-sm font-medium text-foreground">
              Cross-Source Reconciliation
            </span>
            <span
              className={`ml-auto text-sm font-bold ${
                reconciliation.reconciliationScore >= 80
                  ? "text-success"
                  : reconciliation.reconciliationScore >= 50
                  ? "text-warning"
                  : "text-destructive"
              }`}
            >
              {reconciliation.reconciliationScore}%
            </span>
          </div>
          {reconciliation.passed ? (
            <p className="text-xs text-muted-foreground">
              Invoice totals match bank deposits. Receipt totals match bank
              payments.
            </p>
          ) : (
            <div className="space-y-1">
              {reconciliation.mismatches.map((mismatch, i) => (
                <p key={i} className="text-xs text-warning">
                  ⚠ {mismatch}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Anomalies by Category */}
        {Object.entries(groupedAnomalies).length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Detected Anomalies
            </h4>
            {Object.entries(groupedAnomalies).map(
              ([category, categoryAnomalies]) => {
                const catConfig = categoryConfig[
                  category as keyof typeof categoryConfig
                ] || { label: category, color: "text-muted-foreground" };
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${catConfig.color.replace(
                          "text-",
                          "bg-"
                        )}`}
                      />
                      <span
                        className={`text-xs font-medium ${catConfig.color}`}
                      >
                        {catConfig.label} ({categoryAnomalies.length})
                      </span>
                    </div>
                    {categoryAnomalies.map((anomaly, i) => {
                      const severity = severityConfig[anomaly.severity];
                      const Icon = severity.icon;
                      const globalIndex = anomalies.indexOf(anomaly);
                      const isExpanded = expandedAnomalies.has(globalIndex);

                      return (
                        <Collapsible
                          key={i}
                          open={isExpanded}
                          onOpenChange={() => toggleAnomaly(globalIndex)}
                        >
                          <div
                            className={`rounded-lg border ${severity.border} ${severity.bg}`}
                          >
                            <CollapsibleTrigger className="w-full p-3">
                              <div className="flex items-start gap-2">
                                <Icon
                                  className={`w-4 h-4 ${severity.color} flex-shrink-0 mt-0.5`}
                                />
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span
                                      className={`text-sm font-medium ${severity.color}`}
                                    >
                                      {anomaly.type.replace(/_/g, " ")}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${severity.color}`}
                                    >
                                      {severity.label}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs ml-auto"
                                    >
                                      -{anomaly.confidenceReduction}%
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {anomaly.description}
                                  </p>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2 ml-6">
                                <div>
                                  <span className="text-xs font-medium text-foreground">
                                    Data Points:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {anomaly.dataPoints.map((point, j) => (
                                      <span
                                        key={j}
                                        className="text-xs px-2 py-0.5 rounded bg-background text-muted-foreground"
                                      >
                                        {point}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-foreground">
                                    Recommendation:
                                  </span>
                                  <p className="text-xs text-accent mt-0.5">
                                    {anomaly.recommendation}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Detection:{" "}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {anomaly.detectionMethod}
                                  </span>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              No anomalies detected
            </p>
            <p className="text-xs text-muted-foreground">
              Your financial data passed all anti-fraud checks
            </p>
          </div>
        )}

        {/* Detection Methods Info */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p>
              We check for: revenue spikes, round numbers, repeated amounts,
              date inconsistencies, upload velocity, timing patterns, file
              metadata, and financial ratio anomalies. Issues reduce your
              confidence level and credibility score.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
