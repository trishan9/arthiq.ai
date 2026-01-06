import { Shield, AlertTriangle, CheckCircle, FileCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ComplianceReadinessScore } from "@/hooks/use-credibility-score";
import { Badge } from "@/components/ui/badge";

interface ComplianceReadinessCardProps {
  compliance: ComplianceReadinessScore;
}

export function ComplianceReadinessCard({
  compliance,
}: ComplianceReadinessCardProps) {
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

  const getStatusLabel = (score: number) => {
    if (score >= 80)
      return { label: "Compliant", color: "text-success", bg: "bg-success/10" };

    if (score >= 50)
      return {
        label: "Needs Attention",
        color: "text-warning",
        bg: "bg-warning/10",
      };

    return {
      label: "High Risk",
      color: "text-destructive",
      bg: "bg-destructive/10",
    };
  };

  const status = getStatusLabel(compliance.score);

  const metrics = [
    {
      label: "Document Completeness",

      value: compliance.documentCompleteness,

      description: "Required documents for your business type",

      weight: "40%",
    },

    {
      label: "Risk Patterns",

      value: compliance.riskPatterns,

      description: "No unusual patterns or red flags",

      weight: "30%",
    },

    {
      label: "Record Timeliness",

      value: compliance.timelinessScore,

      description: "Regular monthly record updates",

      weight: "20%",
    },

    {
      label: "Advisory Completion",

      value: compliance.advisoryCompletion,

      description: "Recommended actions completed",

      weight: "10%",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>

            <div>
              <CardTitle className="text-lg">Compliance Readiness</CardTitle>

              <p className="text-sm text-muted-foreground">
                Nepal regulation alignment
              </p>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`text-3xl font-bold ${getScoreColor(
                compliance.score
              )}`}
            >
              {compliance.score}
            </div>

            <Badge
              variant="outline"
              className={`${status.color} ${status.bg} text-xs`}
            >
              {status.label}
            </Badge>
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

        {/* Compliance Flags */}

        {compliance.flags.length > 0 && (
          <div className="pt-4 border-t border-border space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Compliance Issues
            </h4>

            {compliance.flags.map((flag, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm ${
                  flag.type === "critical"
                    ? "bg-destructive/10 border border-destructive/20"
                    : flag.type === "warning"
                    ? "bg-warning/10 border border-warning/20"
                    : "bg-muted border border-border"
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <AlertTriangle
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      flag.type === "critical"
                        ? "text-destructive"
                        : "text-warning"
                    }`}
                  />

                  <span
                    className={
                      flag.type === "critical"
                        ? "text-destructive font-medium"
                        : flag.type === "warning"
                        ? "text-warning font-medium"
                        : "text-foreground"
                    }
                  >
                    {flag.message}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground ml-6">
                  📋 {flag.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* All Good State */}

        {compliance.flags.length === 0 && compliance.score >= 70 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />

              <span className="text-sm font-medium">
                No compliance issues detected
              </span>
            </div>
          </div>
        )}

        {/* Info */}

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            💡 Based on Nepal's Income Tax Act, VAT Act, and financial
            regulations. Higher compliance improves lender confidence.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
