import {
  Shield,
  CheckCircle,
  Circle,
  Lock,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  TrustTierInfo,
  TrustTier,
  TierRequirement,
} from "@/hooks/use-credibility-score";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TrustTierCardProps {
  currentTier: TrustTierInfo;
}

const allTiers: { tier: TrustTier; label: string; description: string }[] = [
  { tier: 0, label: "Self-Declared", description: "Manual entries only" },
  { tier: 1, label: "Document-Backed", description: "Invoices & receipts" },
  { tier: 2, label: "Bank-Supported", description: "Bank corroboration" },
  { tier: 3, label: "Verified", description: "Human + blockchain" },
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

const strengthConfig = {
  weak: { color: "text-warning", bg: "bg-warning/10", label: "Weak" },
  moderate: { color: "text-info", bg: "bg-info/10", label: "Moderate" },
  strong: { color: "text-accent", bg: "bg-accent/10", label: "Strong" },
  verified: { color: "text-success", bg: "bg-success/10", label: "Verified" },
};

export function TrustTierCard({ currentTier }: TrustTierCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const strengthStyle = strengthConfig[currentTier.verificationStrength];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
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
          <div className="flex flex-col items-end gap-1">
            <Badge
              className={`${
                tierColors[currentTier.tier].bg
              } text-primary-foreground`}
            >
              Tier {currentTier.tier}
            </Badge>
            <Badge
              variant="outline"
              className={`${strengthStyle.color} ${strengthStyle.bg} text-xs`}
            >
              {strengthStyle.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tier Progress Visual */}
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
                  className="flex flex-col items-center w-16 md:w-20"
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Anti-Fraud Score */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Shield
              className={`w-4 h-4 ${
                currentTier.antifraudScore >= 80
                  ? "text-success"
                  : currentTier.antifraudScore >= 50
                  ? "text-warning"
                  : "text-destructive"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              Anti-Fraud Score
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={currentTier.antifraudScore} className="w-20 h-2" />
            <span
              className={`text-sm font-bold ${
                currentTier.antifraudScore >= 80
                  ? "text-success"
                  : currentTier.antifraudScore >= 50
                  ? "text-warning"
                  : "text-destructive"
              }`}
            >
              {currentTier.antifraudScore}%
            </span>
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

        {/* Detailed Requirements (Collapsible) */}
        {currentTier.tier < 3 &&
          currentTier.detailedRequirements.length > 0 && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">
                    Progress to Tier {currentTier.tier + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-accent">
                    {currentTier.tierProgress}%
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="space-y-3">
                  {currentTier.detailedRequirements.map((req) => (
                    <RequirementItem key={req.id} requirement={req} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

        {/* Next Tier Preview */}
        {currentTier.nextTierRequirements &&
          currentTier.tier < 3 &&
          !isExpanded && (
            <div className="p-4 rounded-xl bg-muted/50 border border-dashed border-muted-foreground/20">
              <h5 className="text-xs font-medium text-foreground mb-2">
                To reach Tier {currentTier.tier + 1} (
                {allTiers[currentTier.tier + 1].label}):
              </h5>
              <ul className="space-y-1">
                {currentTier.nextTierRequirements.slice(0, 2).map((req, i) => (
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
            <p className="text-xs text-muted-foreground mt-1">
              Your data is verified by human attestation and anchored on
              blockchain
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RequirementItem({ requirement }: { requirement: TierRequirement }) {
  const progress = requirement.completed ? 100 : requirement.progress || 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {requirement.completed ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : progress >= 50 ? (
            <Circle className="w-4 h-4 text-accent fill-accent/30" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
          <span
            className={`text-sm font-medium ${
              requirement.completed
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {requirement.label}
          </span>
        </div>
        <span
          className={`text-xs font-medium ${
            requirement.completed
              ? "text-success"
              : progress >= 50
              ? "text-accent"
              : "text-muted-foreground"
          }`}
        >
          {progress}%
        </span>
      </div>
      <Progress value={progress} className="h-1.5" />
      <p className="text-xs text-muted-foreground pl-6">
        {requirement.description}
      </p>
    </div>
  );
}
