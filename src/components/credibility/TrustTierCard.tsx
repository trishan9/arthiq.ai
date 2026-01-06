import { Shield, CheckCircle, Circle, Lock, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrustTierInfo, TrustTier } from "@/hooks/use-credibility-score";
import { Badge } from "@/components/ui/badge";

interface TrustTierCardProps {
  currentTier: TrustTierInfo;
}

const allTiers: { tier: TrustTier; label: string; description: string }[] = [
  { tier: 0, label: "Self-Declared", description: "Manual entries only" },

  {
    tier: 1,
    label: "Document-Backed",
    description: "Invoices & receipts uploaded",
  },

  {
    tier: 2,
    label: "Bank-Supported",
    description: "Bank statement corroboration",
  },

  { tier: 3, label: "Verified", description: "Human attestation + blockchain" },
];

const tierColors: Record<
  TrustTier,
  { color: string; bg: string; ring: string }
> = {
  0: { color: "text-muted-foreground", bg: "bg-muted", ring: "ring-muted" },

  1: { color: "text-info", bg: "bg-info", ring: "ring-info" },

  2: { color: "text-accent", bg: "bg-accent", ring: "ring-accent" },

  3: { color: "text-success", bg: "bg-success", ring: "ring-success" },
};

export function TrustTierCard({ currentTier }: TrustTierCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>

          <div>
            <CardTitle className="text-lg">Trust Tier</CardTitle>

            <p className="text-sm text-muted-foreground">
              Your credibility verification level
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tier Progress */}

        <div className="relative">
          {/* Progress Line */}

          <div className="absolute top-5 left-5 right-5 h-1 bg-muted rounded-full">
            <div
              className="h-full bg-gradient-to-r from-muted-foreground via-info via-accent to-success rounded-full transition-all duration-500"
              style={{ width: `${(currentTier.tier / 3) * 100}%` }}
            />
          </div>

          {/* Tier Nodes */}

          <div className="flex justify-between relative z-10">
            {allTiers.map((tier) => {
              const isCompleted = tier.tier < currentTier.tier;

              const isCurrent = tier.tier === currentTier.tier;

              const colors = tierColors[tier.tier];

              return (
                <div
                  key={tier.tier}
                  className="flex flex-col items-center w-20"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? `${colors.bg} border-transparent`
                        : isCurrent
                        ? `bg-background border-2 ${colors.ring} ring-2 ring-offset-2 ring-offset-background`
                        : "bg-background border-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-primary-foreground" />
                    ) : isCurrent ? (
                      <span className={`text-sm font-bold ${colors.color}`}>
                        {tier.tier}
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <span
                    className={`text-xs mt-2 text-center font-medium ${
                      isCurrent
                        ? colors.color
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tier.label}
                  </span>

                  <span className="text-[10px] text-muted-foreground text-center mt-0.5">
                    {tier.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Tier Details */}

        <div
          className={`p-4 rounded-xl border ${
            tierColors[currentTier.tier].ring
          }/20 ${tierColors[currentTier.tier].bg}/10`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={`${
                tierColors[currentTier.tier].bg
              } text-primary-foreground`}
            >
              Tier {currentTier.tier}
            </Badge>

            <span className="font-semibold text-foreground">
              {currentTier.label}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {currentTier.description}
          </p>

          <h5 className="text-xs font-medium text-foreground mb-2">
            Requirements Met:
          </h5>

          <ul className="space-y-1">
            {currentTier.requirements.map((req, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <CheckCircle className="w-3 h-3 text-success" />

                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Next Tier */}

        {currentTier.nextTierRequirements && currentTier.tier < 3 && (
          <div className="p-4 rounded-xl bg-muted/50 border border-dashed border-muted-foreground/20">
            <h5 className="text-xs font-medium text-foreground mb-2">
              To reach Tier {currentTier.tier + 1} (
              {allTiers[currentTier.tier + 1].label}):
            </h5>

            <ul className="space-y-1">
              {currentTier.nextTierRequirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Circle className="w-3 h-3" />

                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Max Tier */}

        {currentTier.tier === 3 && (
          <div className="text-center py-2">
            <Award className="w-8 h-8 text-success mx-auto mb-2" />

            <p className="text-sm font-medium text-success">
              Maximum Trust Level Achieved!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
