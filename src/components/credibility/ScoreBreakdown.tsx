import { TrendingUp, FileText, Shield, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ScoreBreakdownProps {
  hasData: boolean;
  activeProofsCount: number;
  financialHealthScore: number;
  vatCollected: number;
  documentCount: number;
  profitMargin: number;
}

interface ScoreFactor {
  name: string;
  description: string;
  weight: number;
  score: number;
  maxScore: number;
  icon: React.ElementType;
  status: "good" | "warning" | "critical";
  suggestion?: string;
}

export function ScoreBreakdown({ 
  hasData, 
  activeProofsCount, 
  financialHealthScore, 
  vatCollected,
  documentCount,
  profitMargin
}: ScoreBreakdownProps) {
  // Calculate individual factor scores
  const calculateFactors = (): ScoreFactor[] => {
    const factors: ScoreFactor[] = [];

    // Factor 1: Data Availability (Base 60 points if data exists)
    const dataScore = hasData ? 60 : 0;
    factors.push({
      name: "Financial Data",
      description: "Uploaded documents and transaction data",
      weight: 60,
      score: dataScore,
      maxScore: 60,
      icon: FileText,
      status: dataScore >= 60 ? "good" : dataScore >= 30 ? "warning" : "critical",
      suggestion: !hasData ? "Upload invoices, bank statements, or financial documents to build your credibility foundation." : undefined
    });

    // Factor 2: Active Blockchain Proofs (5 points each, max 20)
    const proofScore = Math.min(activeProofsCount * 5, 20);
    factors.push({
      name: "Blockchain Proofs",
      description: `${activeProofsCount} active verification proofs`,
      weight: 20,
      score: proofScore,
      maxScore: 20,
      icon: Shield,
      status: proofScore >= 15 ? "good" : proofScore >= 5 ? "warning" : "critical",
      suggestion: proofScore < 20 ? `Generate ${Math.ceil((20 - proofScore) / 5)} more blockchain proofs to maximize this score component.` : undefined
    });

    // Factor 3: Financial Health (10% of health score, max 10 points)
    const healthScore = Math.round(financialHealthScore / 10);
    factors.push({
      name: "Financial Health",
      description: "Based on profit margins and cash flow",
      weight: 10,
      score: Math.min(healthScore, 10),
      maxScore: 10,
      icon: TrendingUp,
      status: healthScore >= 7 ? "good" : healthScore >= 4 ? "warning" : "critical",
      suggestion: healthScore < 7 ? "Improve profit margins and maintain healthy cash flow to boost this score." : undefined
    });

    // Factor 4: VAT Compliance (5 points if collecting VAT)
    const vatScore = vatCollected > 0 ? 5 : 0;
    factors.push({
      name: "VAT Compliance",
      description: vatCollected > 0 ? `NPR ${vatCollected.toLocaleString()} collected` : "Not collecting VAT",
      weight: 5,
      score: vatScore,
      maxScore: 5,
      icon: CheckCircle,
      status: vatScore > 0 ? "good" : "warning",
      suggestion: vatScore === 0 ? "Record VAT-inclusive transactions to demonstrate tax compliance." : undefined
    });

    return factors;
  };

  const factors = calculateFactors();
  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  const maxPossibleScore = factors.reduce((sum, f) => sum + f.maxScore, 0);

  // Get improvement suggestions sorted by impact
  const suggestions = factors
    .filter(f => f.suggestion)
    .sort((a, b) => (b.maxScore - b.score) - (a.maxScore - a.score));

  return (
    <div className="space-y-6">
      {/* Score Formula */}
      <div className="bg-muted/30 rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-accent" />
          <h4 className="font-medium text-foreground text-sm">Score Calculation Formula</h4>
        </div>
        <div className="font-mono text-xs text-muted-foreground bg-background/50 rounded-lg p-3">
          <span className="text-accent">Credibility Score</span> = 
          <span className="text-success"> Data (60pts)</span> + 
          <span className="text-info"> Proofs (5pts × count, max 20)</span> + 
          <span className="text-warning"> Health (10%)</span> + 
          <span className="text-primary"> VAT (5pts)</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Maximum score: 95 points | Your score: <span className="font-bold text-foreground">{Math.min(totalScore, 95)} points</span>
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          Score Breakdown
        </h4>
        
        {factors.map((factor, index) => {
          const Icon = factor.icon;
          const percentage = (factor.score / factor.maxScore) * 100;
          
          return (
            <div key={index} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    factor.status === "good" && "bg-success/10",
                    factor.status === "warning" && "bg-warning/10",
                    factor.status === "critical" && "bg-destructive/10"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      factor.status === "good" && "text-success",
                      factor.status === "warning" && "text-warning",
                      factor.status === "critical" && "text-destructive"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{factor.name}</p>
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    {factor.score}<span className="text-muted-foreground font-normal">/{factor.maxScore}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
              
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    factor.status === "good" && "bg-success",
                    factor.status === "warning" && "bg-warning",
                    factor.status === "critical" && "bg-destructive"
                  )} 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Improvement Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Ways to Improve Your Score
          </h4>
          
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-warning">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{suggestion.name}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.suggestion}</p>
                  <p className="text-xs text-warning mt-1">
                    +{suggestion.maxScore - suggestion.score} potential points
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Good Message */}
      {suggestions.length === 0 && hasData && (
        <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 rounded-xl">
          <CheckCircle className="w-5 h-5 text-success" />
          <div>
            <p className="font-medium text-foreground">Excellent Credibility!</p>
            <p className="text-sm text-muted-foreground">
              You've maximized your credibility score. Keep your proofs up to date and maintain your financial health.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
