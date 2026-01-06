import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Minus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StabilityGrowthScore } from "@/hooks/use-credibility-score";
import { Badge } from "@/components/ui/badge";

interface StabilityGrowthCardProps {
  stability: StabilityGrowthScore;
}

export function StabilityGrowthCard({ stability }: StabilityGrowthCardProps) {
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

  const getTrendIcon = (value: number) => {
    if (value >= 60) return TrendingUp;

    if (value <= 40) return TrendingDown;

    return Minus;
  };

  const metrics = [
    {
      label: "Revenue Stability",

      value: stability.revenueStability,

      description: "Lower month-to-month revenue variance",

      weight: "25%",
    },

    {
      label: "Cashflow Health",

      value: stability.cashflowHealth,

      description: "Positive operating cashflow",

      weight: "25%",
    },

    {
      label: "Expense Discipline",

      value: stability.expenseDiscipline,

      description: "Controlled expense-to-revenue ratio",

      weight: "20%",
    },

    {
      label: "Growth Trend",

      value: stability.growthTrend,

      description: "Consistent revenue growth pattern",

      weight: "20%",
    },

    {
      label: "Seasonality Handling",

      value: stability.seasonalityHandling,

      description: "Adapts to Nepali fiscal patterns",

      weight: "10%",
    },
  ];

  const TrendIcon = getTrendIcon(stability.growthTrend);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendIcon
                className={`w-5 h-5 ${getScoreColor(stability.score)}`}
              />
            </div>

            <div>
              <CardTitle className="text-lg">Stability & Growth</CardTitle>

              <p className="text-sm text-muted-foreground">
                Financial health signals
              </p>
            </div>
          </div>

          <div
            className={`text-3xl font-bold ${getScoreColor(stability.score)}`}
          >
            {stability.score}
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

        {stability.flags.length > 0 && (
          <div className="pt-4 border-t border-border space-y-2">
            <h4 className="text-sm font-medium text-foreground">Signals</h4>

            {stability.flags.map((flag, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                  flag.type === "positive"
                    ? "bg-success/10 text-success"
                    : flag.type === "critical"
                    ? "bg-destructive/10 text-destructive"
                    : flag.type === "warning"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {flag.type === "positive" ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}

                <span>{flag.message}</span>

                {flag.impact !== 0 && (
                  <Badge
                    variant="outline"
                    className={`ml-auto text-xs ${
                      flag.impact > 0 ? "text-success border-success" : ""
                    }`}
                  >
                    {flag.impact > 0 ? "+" : ""}
                    {flag.impact} pts
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* How this affects credibility */}

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            💡 Lenders look for stable, growing businesses. This score directly
            impacts how attractive your business appears on the marketplace.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
