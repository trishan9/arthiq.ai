import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThresholdAlert } from "@/hooks/useRegulationInsights";

interface ThresholdAlertsCardProps {
  alerts: ThresholdAlert[];
}

const statusConfig = {
  below: {
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: ArrowDown,
    label: "Below Threshold",
  },
  approaching: {
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: Minus,
    label: "Approaching",
  },
  exceeded: {
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: ArrowUp,
    label: "Exceeded",
  },
};

export function ThresholdAlertsCard({ alerts }: ThresholdAlertsCardProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Regulatory Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No threshold alerts at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          Regulatory Thresholds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => {
          const config = statusConfig[alert.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border border-border/50",
                config.bgColor
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{alert.threshold}</h4>
                    <Badge variant="outline" className={config.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current: </span>
                      <span className="font-medium">{alert.currentValue}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Threshold: </span>
                      <span className="font-medium">{alert.thresholdValue}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">{alert.implication}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
