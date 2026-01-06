import {
  Trophy,
  TrendingUp,
  Shield,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SMEProfile, EligibilityCriteria } from "@/hooks/use-market-place";
import { cn } from "@/lib/utils";

interface SMELeaderboardProps {
  leaderboard: Array<{
    sme: SMEProfile;
    eligible: boolean;
    matchPercentage: number;
    missingRequirements: string[];
  }>;
  selectedCriteria?: EligibilityCriteria;
  onInviteSME?: (sme: SMEProfile) => void;
  onViewProfile?: (sme: SMEProfile) => void;
}

const tierLabels = [
  "Self-Declared",
  "Document-Backed",
  "Bank-Supported",
  "Verified",
];
const tierColors = [
  "text-muted-foreground",
  "text-blue-500",
  "text-purple-500",
  "text-emerald-500",
];

export function SMELeaderboard({
  leaderboard,
  selectedCriteria,
  onInviteSME,
  onViewProfile,
}: SMELeaderboardProps) {
  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-amber-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-slate-400" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-700" />;
    return (
      <span className="text-muted-foreground font-medium">#{index + 1}</span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            SME Leaderboard
          </CardTitle>
          {selectedCriteria && (
            <Badge variant="outline" className="text-xs">
              Filtered by: {selectedCriteria.name}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedCriteria
            ? "SMEs ranked by eligibility match and credibility score"
            : "Top performing SMEs by credibility score"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard.map((item, index) => (
          <div
            key={item.sme.id}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200",
              item.eligible
                ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                : "bg-muted/30 border-border/50 hover:border-border"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {getRankIcon(index)}
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">
                    {item.sme.business_name}
                  </h4>
                  {item.eligible && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                      Eligible
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{item.sme.business_type}</span>
                  <span>•</span>
                  <span className={tierColors[item.sme.trust_tier]}>
                    {tierLabels[item.sme.trust_tier]}
                  </span>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="text-center">
                    <div
                      className={cn(
                        "text-lg font-bold",
                        getScoreColor(item.sme.credibility_score)
                      )}
                    >
                      {item.sme.credibility_score}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Credibility
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground/80">
                      {Math.round(item.sme.evidence_quality_score)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Evidence
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground/80">
                      {Math.round(item.sme.stability_score)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Stability
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground/80">
                      {Math.round(item.sme.compliance_score)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Compliance
                    </div>
                  </div>
                </div>

                {/* Match Progress (when criteria selected) */}
                {selectedCriteria && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Criteria Match
                      </span>
                      <span
                        className={
                          item.eligible
                            ? "text-emerald-500"
                            : "text-muted-foreground"
                        }
                      >
                        {item.matchPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={item.matchPercentage}
                      className={cn(
                        "h-1.5",
                        item.eligible ? "[&>div]:bg-emerald-500" : ""
                      )}
                    />
                    {item.missingRequirements.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.missingRequirements.slice(0, 2).map((req, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px] text-amber-600 border-amber-500/30"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                            {req}
                          </Badge>
                        ))}
                        {item.missingRequirements.length > 2 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{item.missingRequirements.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {item.sme.total_documents} docs
                  </span>
                  {item.sme.anomaly_count > 0 && (
                    <span className="flex items-center gap-1 text-amber-500">
                      <AlertTriangle className="h-3 w-3" />
                      {item.sme.anomaly_count} flags
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewProfile?.(item.sme)}
                  className="text-xs"
                >
                  View
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
                {item.eligible && onInviteSME && (
                  <Button
                    size="sm"
                    onClick={() => onInviteSME(item.sme)}
                    className="text-xs"
                  >
                    Invite
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No SMEs found matching the criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
