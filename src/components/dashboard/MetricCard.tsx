import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  variant?: "default" | "highlight" | "warning" | "success";
}

const MetricCard = ({ 
  title, 
  value, 
  subtitle,
  change, 
  icon: Icon,
  iconColor = "text-accent",
  iconBgColor = "bg-accent/10",
  variant = "default"
}: MetricCardProps) => {
  const variantStyles = {
    default: "bg-card border-border",
    highlight: "bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20",
    warning: "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20",
    success: "bg-gradient-to-br from-success/10 to-success/5 border-success/20",
  };

  return (
    <div className={cn(
      "rounded-xl border p-5 hover:shadow-card transition-all duration-300",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          
          {change && (
            <div className="flex items-center gap-1.5 mt-2">
              {change.trend === "up" ? (
                <TrendingUp className="w-3.5 h-3.5 text-success" />
              ) : change.trend === "down" ? (
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className={cn(
                "text-xs font-medium",
                change.trend === "up" && "text-success",
                change.trend === "down" && "text-destructive",
                change.trend === "neutral" && "text-muted-foreground"
              )}>
                {change.value}
              </span>
              {change.label && (
                <span className="text-xs text-muted-foreground">{change.label}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconBgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
