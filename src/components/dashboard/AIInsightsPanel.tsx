import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FinancialMetrics } from "@/hooks/useFinancialData";

interface AIInsightsPanelProps {
  metrics: FinancialMetrics;
  hasData: boolean;
}

const AIInsightsPanel = ({ metrics, hasData }: AIInsightsPanelProps) => {
  const navigate = useNavigate();
  
  const profitMargin = metrics.totalRevenue > 0 
    ? ((metrics.totalRevenue - metrics.totalExpenses) / metrics.totalRevenue) * 100 
    : 0;

  const insights = hasData ? [
    {
      type: "opportunity" as const,
      icon: Lightbulb,
      title: "Cost Optimization Opportunity",
      description: profitMargin < 20 
        ? `Your profit margin is ${profitMargin.toFixed(1)}%. Consider reviewing expense categories for optimization.`
        : `Strong profit margin at ${profitMargin.toFixed(1)}%. Keep maintaining expense efficiency.`,
      priority: profitMargin < 20 ? "high" : "low",
    },
    {
      type: "prediction" as const,
      icon: TrendingUp,
      title: "Revenue Forecast",
      description: `Based on current trends, next month's projected revenue is ₨ ${((metrics.totalRevenue * 1.1) / 100000).toFixed(2)} L (+10%)`,
      priority: "medium" as const,
    },
    {
      type: "alert" as const,
      icon: AlertTriangle,
      title: "VAT Filing Reminder",
      description: metrics.vatCollected > 0 
        ? `You have ₨ ${(metrics.vatCollected / 1000).toFixed(1)}K VAT collected. Ensure timely filing by the 25th.`
        : "Track your VAT collection for compliance requirements.",
      priority: metrics.vatCollected > 50000 ? "high" : "medium",
    },
  ] : [
    {
      type: "info" as const,
      icon: Sparkles,
      title: "Get Started with AI Insights",
      description: "Upload your financial documents to receive personalized AI-powered insights and recommendations.",
      priority: "low" as const,
    },
  ];

  const priorityColors = {
    high: "border-destructive/50 bg-destructive/5",
    medium: "border-warning/50 bg-warning/5",
    low: "border-success/50 bg-success/5",
  };

  const iconColors = {
    opportunity: "text-accent bg-accent/10",
    prediction: "text-info bg-info/10",
    alert: "text-warning bg-warning/10",
    info: "text-muted-foreground bg-muted",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
            <p className="text-xs text-muted-foreground">Real-time analysis of your finances</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => navigate("/dashboard/insights")}
        >
          View All <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border transition-all hover:shadow-sm ${priorityColors[insight.priority as keyof typeof priorityColors]}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors[insight.type]}`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">{insight.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsightsPanel;
