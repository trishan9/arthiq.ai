import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, AlertCircle, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaxObligation } from "@/hooks/useRegulationInsights";

interface TaxObligationsCardProps {
  obligations: TaxObligation[];
}

const statusConfig = {
  compliant: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Compliant",
  },
  at_risk: {
    icon: AlertCircle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "At Risk",
  },
  non_compliant: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Non-Compliant",
  },
  needs_review: {
    icon: HelpCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Needs Review",
  },
};

const typeIcons: Record<string, string> = {
  VAT: "🏷️",
  "Income Tax": "💰",
  TDS: "📋",
  SSF: "👥",
  Other: "📄",
};

export function TaxObligationsCard({ obligations }: TaxObligationsCardProps) {
  if (!obligations || obligations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Tax Obligations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No tax obligations analyzed yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Tax Obligations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {obligations.map((obligation, index) => {
          const config = statusConfig[obligation.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border",
                config.bgColor,
                "border-border/50"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{typeIcons[obligation.type] || "📄"}</span>
                  <div>
                    <h4 className="font-semibold">{obligation.type}</h4>
                    <p className="text-sm text-muted-foreground">{obligation.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn(config.color, "shrink-0")}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="font-medium">Current Situation: </span>
                  <span className="text-muted-foreground">{obligation.currentSituation}</span>
                </div>
                <div>
                  <span className="font-medium">Required Action: </span>
                  <span className="text-muted-foreground">{obligation.requiredAction}</span>
                </div>
                {obligation.deadline && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Deadline: </span>
                    <span className="text-muted-foreground">{obligation.deadline}</span>
                  </div>
                )}
                {obligation.potentialPenalty && (
                  <div className="text-red-500 text-xs mt-2">
                    ⚠️ Potential Penalty: {obligation.potentialPenalty}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
