import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Risk } from "@/hooks/useRegulationInsights";

interface RisksCardProps {
  risks: Risk[];
}

const severityConfig = {
  low: {
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  medium: {
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  high: {
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  critical: {
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
};

export function RisksCard({ risks }: RisksCardProps) {
  if (!risks || risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Identified Risks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No risks identified.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by severity
  const sortedRisks = [...risks].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Identified Risks
          <Badge variant="secondary" className="ml-auto">
            {risks.length} {risks.length === 1 ? "risk" : "risks"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedRisks.map((risk, index) => {
          const config = severityConfig[risk.severity];

          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={config.color}>
                      {risk.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary">{risk.category}</Badge>
                  </div>
                  <h4 className="font-semibold mt-2">{risk.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                </div>
              </div>

              {risk.financialImpact && (
                <div className="flex items-center gap-2 mt-3 text-sm">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Financial Impact:</span>
                  <span className="text-red-500">{risk.financialImpact}</span>
                </div>
              )}

              <div className="mt-3 p-2 bg-background/50 rounded text-sm">
                <span className="font-medium">💡 Recommendation: </span>
                <span className="text-muted-foreground">{risk.recommendation}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
