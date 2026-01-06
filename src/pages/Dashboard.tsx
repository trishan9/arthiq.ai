import {
  TrendingUp,
  FileText,
  Loader2,
  ArrowUpRight,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle,
  PiggyBank,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CashflowChart from "@/components/dashboard/CashflowChart";
import ExpenseBreakdown from "@/components/dashboard/ExpenseBreakdown";
import RecentDocuments from "@/components/dashboard/RecentDocuments";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";
import ProfitTrendChart from "@/components/dashboard/ProfitTrendChart";
import RevenueCategoryChart from "@/components/dashboard/RevenueCategoryChart";
import { useCredibilityScore } from "@/hooks/use-credibility-score";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import MetricCard from "@/components/dashboard/MetricCard";

const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₨ ${(amount / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  }
  if (amount >= 1000) {
    return `₨ ${(amount / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `₨ ${amount.toLocaleString()}`;
};

const Dashboard = () => {
  const { credibilityScore, metrics, isLoading, hasData } =
    useCredibilityScore();
  const navigate = useNavigate();

  const netProfit = metrics.totalRevenue - metrics.totalExpenses;
  const profitMargin =
    metrics.totalRevenue > 0
      ? ((netProfit / metrics.totalRevenue) * 100).toFixed(1)
      : "0";

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 50) return "text-accent";
    if (score >= 30) return "text-warning";
    return "text-destructive";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Financial Overview"
        subtitle={
          hasData
            ? "Your financial activity builds your credibility score"
            : "Upload documents to start building your credibility"
        }
      />

      <div className="p-6 space-y-6">
        {/* Credibility Score Hero Banner */}
        <div className="bg-gradient-hero rounded-2xl p-6 text-primary-foreground">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Mini Score Circle */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    fill="none"
                    stroke="url(#miniGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={
                      2 * Math.PI * 42 * (1 - credibilityScore.totalScore / 100)
                    }
                  />
                  <defs>
                    <linearGradient
                      id="miniGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="hsl(38 92% 50%)" />
                      <stop offset="100%" stopColor="hsl(152 69% 40%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">
                    {credibilityScore.totalScore}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">Credibility Score</h3>
                  <Badge
                    variant="outline"
                    className="text-accent bg-accent/20 border-accent/30"
                  >
                    Tier {credibilityScore.trustTier.tier}
                  </Badge>
                </div>
                <p className="text-sm text-primary-foreground/70 mb-2">
                  {credibilityScore.trustTier.label} •{" "}
                  {credibilityScore.confidenceLevel} confidence
                </p>
                <div className="flex gap-4 text-xs">
                  <span>
                    Evidence:{" "}
                    <span
                      className={getScoreColor(
                        credibilityScore.evidenceQuality.score
                      )}
                    >
                      {credibilityScore.evidenceQuality.score}
                    </span>
                  </span>
                  <span>
                    Stability:{" "}
                    <span
                      className={getScoreColor(
                        credibilityScore.stabilityGrowth.score
                      )}
                    >
                      {credibilityScore.stabilityGrowth.score}
                    </span>
                  </span>
                  <span>
                    Compliance:{" "}
                    <span
                      className={getScoreColor(
                        credibilityScore.complianceReadiness.score
                      )}
                    >
                      {credibilityScore.complianceReadiness.score}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {credibilityScore.improvementActions.length > 0 && (
                <div className="text-right hidden md:block">
                  <p className="text-sm text-primary-foreground/70">
                    Top action:
                  </p>
                  <p className="text-sm font-medium text-accent">
                    {credibilityScore.improvementActions[0].title}
                  </p>
                  <p className="text-xs text-primary-foreground/50">
                    +{credibilityScore.improvementActions[0].potentialGain} pts
                  </p>
                </div>
              )}
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard/credibility")}
              >
                View Details <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* How This Affects Credibility - Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Evidence Quality
                </p>
                <p className="text-xs text-muted-foreground">
                  Document-backed entries
                </p>
              </div>
              <span
                className={`ml-auto text-2xl font-bold ${getScoreColor(
                  credibilityScore.evidenceQuality.score
                )}`}
              >
                {credibilityScore.evidenceQuality.score}
              </span>
            </div>
            <Progress
              value={credibilityScore.evidenceQuality.documentBackedRatio}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(credibilityScore.evidenceQuality.documentBackedRatio)}
              % of entries have supporting documents
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Financial Stability
                </p>
                <p className="text-xs text-muted-foreground">
                  Growth & health signals
                </p>
              </div>
              <span
                className={`ml-auto text-2xl font-bold ${getScoreColor(
                  credibilityScore.stabilityGrowth.score
                )}`}
              >
                {credibilityScore.stabilityGrowth.score}
              </span>
            </div>
            <Progress
              value={credibilityScore.stabilityGrowth.cashflowHealth}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {netProfit >= 0 ? "Positive cashflow" : "Negative cashflow"} •{" "}
              {profitMargin}% margin
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Compliance
                </p>
                <p className="text-xs text-muted-foreground">
                  Nepal regulations
                </p>
              </div>
              <span
                className={`ml-auto text-2xl font-bold ${getScoreColor(
                  credibilityScore.complianceReadiness.score
                )}`}
              >
                {credibilityScore.complianceReadiness.score}
              </span>
            </div>
            <Progress
              value={credibilityScore.complianceReadiness.documentCompleteness}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {credibilityScore.complianceReadiness.flags.length === 0
                ? "No compliance issues"
                : `${credibilityScore.complianceReadiness.flags.length} issues need attention`}
            </p>
          </div>
        </div>

        {/* Anti-Fraud Status */}
        {(credibilityScore.anomalies.length > 0 ||
          !credibilityScore.crossSourceReconciliation.passed) && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground">
                  Data Quality Alerts
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  These issues affect your confidence level and credibility
                  score
                </p>
                <div className="flex flex-wrap gap-2">
                  {credibilityScore.anomalies.map((anomaly, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-warning bg-warning/10"
                    >
                      {anomaly.type.replace(/_/g, " ")}
                    </Badge>
                  ))}
                  {!credibilityScore.crossSourceReconciliation.passed && (
                    <Badge
                      variant="outline"
                      className="text-warning bg-warning/10"
                    >
                      Source Mismatch
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => navigate("/dashboard/credibility")}
              >
                Review
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={hasData ? formatCurrency(metrics.totalRevenue) : "₨ 0"}
            change={{
              value: hasData ? `+${metrics.revenueChange}%` : "No data",
              trend: hasData ? "up" : "neutral",
              label: "vs last month",
            }}
            icon={Wallet}
            iconColor="text-success"
            iconBgColor="bg-success/10"
            variant={hasData ? "success" : "default"}
          />
          <MetricCard
            title="Total Expenses"
            value={hasData ? formatCurrency(metrics.totalExpenses) : "₨ 0"}
            change={{
              value: hasData ? `+${metrics.expenseChange}%` : "No data",
              trend: hasData ? "up" : "neutral",
              label: "vs last month",
            }}
            icon={CreditCard}
            iconColor="text-destructive"
            iconBgColor="bg-destructive/10"
          />
          <MetricCard
            title="Net Profit"
            value={hasData ? formatCurrency(netProfit) : "₨ 0"}
            subtitle={hasData ? `${profitMargin}% margin` : undefined}
            change={{
              value: hasData ? "+5.2%" : "No data",
              trend: netProfit > 0 ? "up" : "down",
            }}
            icon={PiggyBank}
            iconColor="text-accent"
            iconBgColor="bg-accent/10"
            variant={netProfit > 0 ? "highlight" : "default"}
          />
          <MetricCard
            title="Documents"
            value={metrics.totalDocuments.toString()}
            change={{
              value: `${metrics.pendingDocuments} pending`,
              trend: "neutral",
            }}
            icon={FileText}
            iconColor="text-info"
            iconBgColor="bg-info/10"
          />
        </div>

        {/* All Clear Banner */}
        {credibilityScore.anomalies.length === 0 &&
          credibilityScore.crossSourceReconciliation.passed &&
          hasData && (
            <div className="bg-success/10 border border-success/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <h4 className="font-medium text-foreground">
                    Data Integrity Verified
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    No anomalies detected • Cross-source reconciliation passed
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Charts Row - Framed as "What builds your score" */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Stability & Growth Signals
            <span className="text-sm font-normal text-muted-foreground ml-2">
              — These metrics build your credibility
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CashflowChart data={metrics.monthlyData} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfitTrendChart data={metrics.monthlyData} hasData={hasData} />
          <RevenueCategoryChart
            data={metrics.revenueCategories}
            hasData={hasData}
          />
          <ExpenseBreakdown data={metrics.expenseCategories} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
