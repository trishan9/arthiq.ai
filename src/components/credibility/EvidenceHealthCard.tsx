import { FileText, AlertTriangle, Info, Upload } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EvidenceQualityScore } from "@/hooks/use-credibility-score";
import { Badge } from "@/components/ui/badge";

interface EvidenceHealthCardProps {
  evidence: EvidenceQualityScore;
}

export function EvidenceHealthCard({ evidence }: EvidenceHealthCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 70) return "text-success";

    if (value >= 50) return "text-accent";

    if (value >= 30) return "text-warning";

    return "text-destructive";
  };

  const getProgressColor = (value: number) => {
    if (value >= 70) return "bg-success";

    if (value >= 50) return "bg-accent";

    if (value >= 30) return "bg-warning";

    return "bg-destructive";
  };

  const metrics = [
    {
      label: "Document-Backed Ratio",

      value: evidence.documentBackedRatio,

      description: "Entries supported by actual documents vs manual entries",

      weight: "60%",
    },

    {
      label: "Consistency Score",

      value: evidence.consistencyScore,

      description: "No duplicates or conflicting data detected",

      weight: "20%",
    },

    {
      label: "Continuity Score",

      value: evidence.continuityScore,

      description: "Monthly evidence coverage over time",

      weight: "15%",
    },

    {
      label: "Data Quality",

      value: evidence.metadataScore,

      description: "All documents successfully processed",

      weight: "5%",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-info" />
            </div>

            <div>
              <CardTitle className="text-lg">Evidence Health</CardTitle>

              <p className="text-sm text-muted-foreground">
                Quality of financial evidence
              </p>
            </div>
          </div>

          <div
            className={`text-3xl font-bold ${getScoreColor(evidence.score)}`}
          >
            {evidence.score}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics Breakdown */}

        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{metric.label}</span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    ({metric.weight})
                  </span>

                  <span
                    className={`font-medium ${getScoreColor(metric.value)}`}
                  >
                    {Math.round(metric.value)}%
                  </span>
                </div>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(
                    metric.value
                  )} transition-all duration-500`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        {/* Flags */}

        {evidence.flags.length > 0 && (
          <div className="pt-4 border-t border-border space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Issues Detected
            </h4>

            {evidence.flags.map((flag, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                  flag.type === "critical"
                    ? "bg-destructive/10 text-destructive"
                    : flag.type === "warning"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {flag.type === "critical" ? (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : flag.type === "warning" ? (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}

                <span>{flag.message}</span>

                {flag.impact > 0 && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    -{flag.impact} pts
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}

        {evidence.score === 0 && (
          <div className="text-center py-6">
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />

            <p className="text-sm text-muted-foreground">
              Upload documents to build your evidence score
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
