import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  iconColor = "text-accent",
  iconBgColor = "bg-accent/10"
}: StatsCardProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 hover:shadow-card transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {change.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : change.trend === "down" ? (
                <TrendingDown className="w-4 h-4 text-destructive" />
              ) : null}
              <span className={cn(
                "text-sm font-medium",
                change.trend === "up" && "text-success",
                change.trend === "down" && "text-destructive",
                change.trend === "neutral" && "text-muted-foreground"
              )}>
                {change.value}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
