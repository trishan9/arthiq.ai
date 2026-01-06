import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { CredibilityScore, TrustTier } from "@/hooks/use-credibility-score";
import { Badge } from "@/components/ui/badge";

interface CredibilityOverviewProps {
  score: CredibilityScore;
}

const tierConfig: Record<
  TrustTier,
  { color: string; bg: string; border: string }
> = {
  0: { color: "text-muted-foreground", bg: "bg-muted", border: "border-muted" },

  1: { color: "text-info", bg: "bg-info/10", border: "border-info/30" },

  2: { color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },

  3: {
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
};

const confidenceConfig = {
  high: { color: "text-success", icon: CheckCircle2, label: "High Confidence" },

  medium: {
    color: "text-accent",
    icon: AlertTriangle,
    label: "Medium Confidence",
  },

  low: {
    color: "text-destructive",
    icon: AlertTriangle,
    label: "Low Confidence",
  },
};

export function CredibilityOverview({ score }: CredibilityOverviewProps) {
  const tier = tierConfig[score.trustTier.tier];

  const confidence = confidenceConfig[score.confidenceLevel];

  const ConfidenceIcon = confidence.icon;

  const getScoreColor = (value: number) => {
    if (value >= 70) return "text-success";

    if (value >= 50) return "text-accent";

    if (value >= 30) return "text-warning";

    return "text-destructive";
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return "Excellent";

    if (value >= 60) return "Good";

    if (value >= 40) return "Fair";

    if (value >= 20) return "Building";

    return "Low";
  };

  return (
    <div className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Score Circle */}

        <div className="relative w-44 h-44 flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="78"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="14"
            />

            <circle
              cx="88"
              cy="88"
              r="78"
              fill="none"
              stroke="url(#credibilityGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 78}
              strokeDashoffset={2 * Math.PI * 78 * (1 - score.totalScore / 100)}
              className="transition-all duration-1000"
            />

            <defs>
              <linearGradient
                id="credibilityGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="hsl(38 92% 50%)" />

                <stop offset="100%" stopColor="hsl(152 69% 40%)" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold">{score.totalScore}</span>

            <span className="text-sm text-primary-foreground/70">
              {getScoreLabel(score.totalScore)}
            </span>
          </div>
        </div>

        {/* Score Info */}

        <div className="flex-1 text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-3">
            <h2 className="text-2xl font-bold">Credibility Score</h2>

            <Badge
              variant="outline"
              className={`${tier.color} ${tier.bg} ${tier.border}`}
            >
              Tier {score.trustTier.tier}: {score.trustTier.label}
            </Badge>
          </div>

          <p className="text-primary-foreground/70 mb-4 max-w-xl">
            {score.trustTier.description}
          </p>

          {/* Confidence Indicator */}

          <div className="flex items-center gap-2 mb-4">
            <ConfidenceIcon className={`w-4 h-4 ${confidence.color}`} />

            <span className={`text-sm font-medium ${confidence.color}`}>
              {confidence.label}
            </span>

            {score.anomalies.length > 0 && (
              <span className="text-xs text-primary-foreground/50 ml-2">
                ({score.anomalies.length} anomalies detected)
              </span>
            )}
          </div>

          {/* Quick Stats */}

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <span className="px-3 py-1 rounded-full bg-white/10 text-sm">
              {score.dataPoints} Documents
            </span>

            {score.crossSourceReconciliation.passed && (
              <span className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                ✓ Sources Reconciled
              </span>
            )}

            {!score.crossSourceReconciliation.passed &&
              score.crossSourceReconciliation.mismatches.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-sm font-medium">
                  ⚠ {score.crossSourceReconciliation.mismatches.length}{" "}
                  Mismatches
                </span>
              )}
          </div>
        </div>

        {/* Layer Breakdown Mini */}

        <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div
              className={`text-2xl font-bold ${getScoreColor(
                score.evidenceQuality.score
              )}`}
            >
              {score.evidenceQuality.score}
            </div>

            <div className="text-xs text-primary-foreground/60">Evidence</div>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/5">
            <div
              className={`text-2xl font-bold ${getScoreColor(
                score.stabilityGrowth.score
              )}`}
            >
              {score.stabilityGrowth.score}
            </div>

            <div className="text-xs text-primary-foreground/60">Stability</div>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/5">
            <div
              className={`text-2xl font-bold ${getScoreColor(
                score.complianceReadiness.score
              )}`}
            >
              {score.complianceReadiness.score}
            </div>

            <div className="text-xs text-primary-foreground/60">Compliance</div>
          </div>
        </div>
      </div>

      {/* Trust Tier Requirements */}

      {score.trustTier.nextTierRequirements &&
        score.trustTier.nextTierRequirements.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />

              <div>
                <p className="text-sm font-medium text-accent mb-2">
                  To advance to Tier {score.trustTier.tier + 1}:
                </p>

                <ul className="text-sm text-primary-foreground/70 space-y-1">
                  {score.trustTier.nextTierRequirements.map((req, i) => (
                    <li key={i}>• {req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
