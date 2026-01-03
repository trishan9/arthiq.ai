import { TrendingUp, AlertTriangle, CheckCircle, FileText } from "lucide-react";

interface FinancialHealthScoreProps {
  score?: number;
  hasData?: boolean;
}

const FinancialHealthScore = ({ score = 78, hasData = true }: FinancialHealthScoreProps) => {
  const displayScore = hasData ? score : 78;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Needs Attention";
  };

  const insights = hasData ? [
    { label: displayScore >= 50 ? "Positive profit margin" : "Low profit margin", type: displayScore >= 50 ? "positive" as const : "warning" as const },
    { label: "Documents being analyzed", type: "positive" as const },
    { label: displayScore >= 60 ? "Healthy cash flow" : "Cash flow needs attention", type: displayScore >= 60 ? "positive" as const : "warning" as const },
  ] : [
    { label: "Strong cashflow position", type: "positive" as const },
    { label: "VAT returns pending", type: "warning" as const },
    { label: "Revenue growth 15% MoM", type: "positive" as const },
    { label: "High expense ratio", type: "warning" as const },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Financial Health Score</h3>
        <p className="text-sm text-muted-foreground">
          {hasData ? "Based on your documents" : "Sample wellness score"}
        </p>
      </div>
      
      <div className="flex items-center gap-8">
        {/* Score Ring */}
        <div className="relative w-[120px] h-[120px] flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            {/* Background Circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="hsl(220 13% 91%)"
              strokeWidth="10"
            />
            {/* Progress Circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(38 92% 50%)" />
                <stop offset="100%" stopColor="hsl(152 69% 40%)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{displayScore}</span>
            <span className="text-xs text-muted-foreground">{getScoreLabel(displayScore)}</span>
          </div>
        </div>
        
        {/* Insights */}
        <div className="flex-1 space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center gap-2">
              {insight.type === "positive" ? (
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
              )}
              <span className="text-sm text-foreground">{insight.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* View Details Button */}
      <button className="w-full mt-6 py-2.5 text-sm font-medium text-accent hover:text-accent/80 border border-border rounded-lg hover:border-accent/30 transition-colors flex items-center justify-center gap-2">
        <TrendingUp className="w-4 h-4" />
        View Detailed Analysis
      </button>
    </div>
  );
};

export default FinancialHealthScore;
