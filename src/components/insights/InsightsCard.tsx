import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Sparkles, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/hooks/useRegulationInsights";

interface InsightsCardProps {
  insights: Insight[];
}

const typeConfig = {
  pattern: {
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    icon: TrendingUp,
    label: "Pattern",
  },
  anomaly: {
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: AlertTriangle,
    label: "Anomaly",
  },
  opportunity: {
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: Sparkles,
    label: "Opportunity",
  },
  warning: {
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    icon: Eye,
    label: "Warning",
  },
};

export function InsightsCard({ insights }: InsightsCardProps) {
  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No insights generated yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const config = typeConfig[insight.type];
          const TypeIcon = config.icon;

          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border border-border/50",
                config.bgColor
              )}
            >
              <div className="flex items-start gap-3">
                <TypeIcon className={cn("h-5 w-5 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  
                  <div className="mt-3 p-2 bg-background/50 rounded text-xs">
                    <span className="font-medium">📊 Data Point: </span>
                    <span className="text-muted-foreground">{insight.dataPoint}</span>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <span className="font-medium">💡 Suggestion: </span>
                    <span className="text-muted-foreground">{insight.suggestion}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
