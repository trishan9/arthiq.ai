import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowRight, Clock, Zap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/hooks/useRegulationInsights";

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

const priorityConfig = {
  immediate: {
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: Zap,
    label: "Immediate",
  },
  short_term: {
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    icon: Clock,
    label: "Short Term",
  },
  medium_term: {
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: Calendar,
    label: "Medium Term",
  },
};

const effortConfig = {
  low: "🟢 Low effort",
  medium: "🟡 Medium effort",
  high: "🔴 High effort",
};

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recommendations at this time.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by priority
  const sortedRecs = [...recommendations].sort((a, b) => {
    const order = { immediate: 0, short_term: 1, medium_term: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedRecs.map((rec, index) => {
          const config = priorityConfig[rec.priority];
          const PriorityIcon = config.icon;

          return (
            <div
              key={index}
              className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", config.bgColor)}>
                  <PriorityIcon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                    <Badge variant="secondary">{rec.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">{rec.expectedBenefit}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {effortConfig[rec.effort]}
                    </span>
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
