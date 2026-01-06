import { AlertTriangle, ShieldAlert, Info, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnomalyAlert } from "@/hooks/use-credibility-score";

interface AnomalyAlertsCardProps {
  anomalies: AnomalyAlert[];

  reconciliation: {
    passed: boolean;
    mismatches: string[];
    reconciliationScore: number;
  };
}

const severityConfig = {
  high: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    label: "High",
  },

  medium: {
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    label: "Medium",
  },

  low: {
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
    label: "Low",
  },
};

export function AnomalyAlertsCard({
  anomalies,
  reconciliation,
}: AnomalyAlertsCardProps) {
  const hasIssues = anomalies.length > 0 || !reconciliation.passed;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                hasIssues ? "bg-warning/10" : "bg-success/10"
              }`}
            >
              {hasIssues ? (
                <ShieldAlert className="w-5 h-5 text-warning" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
            </div>

            <div>
              <CardTitle className="text-lg">Anti-Fraud Check</CardTitle>

              <p className="text-sm text-muted-foreground">
                Anomaly detection & reconciliation
              </p>
            </div>
          </div>

          {hasIssues ? (
            <Badge variant="outline" className="text-warning bg-warning/10">
              {anomalies.length + reconciliation.mismatches.length} issues
            </Badge>
          ) : (
            <Badge variant="outline" className="text-success bg-success/10">
              All Clear
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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

        {/* Anomalies */}

        {anomalies.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Detected Anomalies
            </h4>

            {anomalies.map((anomaly, i) => {
              const severity = severityConfig[anomaly.severity];

              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${severity.border} ${severity.bg}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${severity.color} flex-shrink-0 mt-0.5`}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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

                        <Badge variant="outline" className="text-xs ml-auto">
                          -{anomaly.confidenceReduction} confidence
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-1">
                        {anomaly.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
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
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />

            <p className="text-sm text-muted-foreground">
              No anomalies detected in your financial data
            </p>
          </div>
        )}

        {/* Info */}

        <div className="pt-3 border-t border-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0" />

            <p>
              We check for sudden spikes, round numbers, repeated amounts, and
              cross-source mismatches. Issues reduce your confidence level,
              making it harder to game the score.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
