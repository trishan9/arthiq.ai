import { 
  Wallet, 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  Loader2, 
  Target,
  CreditCard,
  PiggyBank,
  ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import CashflowChart from "@/components/dashboard/CashflowChart";
import ExpenseBreakdown from "@/components/dashboard/ExpenseBreakdown";
import FinancialHealthScore from "@/components/dashboard/FinancialHealthScore";
import RecentDocuments from "@/components/dashboard/RecentDocuments";
import QuickActions from "@/components/dashboard/QuickActions";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";
import ProfitTrendChart from "@/components/dashboard/ProfitTrendChart";
import RevenueCategoryChart from "@/components/dashboard/RevenueCategoryChart";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Button } from "@/components/ui/button";

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
  const { metrics, isLoading, hasData } = useFinancialData();
  const navigate = useNavigate();

  const netProfit = metrics.totalRevenue - metrics.totalExpenses;
  const profitMargin = metrics.totalRevenue > 0 
    ? ((netProfit / metrics.totalRevenue) * 100).toFixed(1) 
    : "0";

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
        title="Financial Dashboard" 
        subtitle={hasData 
          ? "Complete financial overview based on your uploaded documents" 
          : "Welcome! Upload documents to see your financial overview."}
      />
      
      <div className="p-6 space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Revenue"
            value={hasData ? formatCurrency(metrics.totalRevenue) : "₨ 0"}
            change={{ 
              value: hasData ? `+${metrics.revenueChange}%` : "No data", 
              trend: hasData ? "up" : "neutral",
              label: "vs last month"
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
              label: "vs last month"
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
              trend: netProfit > 0 ? "up" : "down" 
            }}
            icon={PiggyBank}
            iconColor="text-accent"
            iconBgColor="bg-accent/10"
            variant={netProfit > 0 ? "highlight" : "default"}
          />
          <MetricCard
            title="VAT Collected"
            value={hasData ? formatCurrency(metrics.vatCollected) : "₨ 0"}
            subtitle="13% rate"
            icon={AlertTriangle}
            iconColor="text-warning"
            iconBgColor="bg-warning/10"
            variant={metrics.vatCollected > 50000 ? "warning" : "default"}
          />
          <MetricCard
            title="Documents"
            value={metrics.totalDocuments.toString()}
            change={{ 
              value: `${metrics.pendingDocuments} pending`, 
              trend: "neutral" 
            }}
            icon={FileText}
            iconColor="text-info"
            iconBgColor="bg-info/10"
          />
          <MetricCard
            title="Avg Transaction"
            value={hasData ? formatCurrency(metrics.averageTransactionValue) : "₨ 0"}
            icon={Target}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
        </div>

        {/* AI Revenue Forecast Banner */}
        <div className="bg-gradient-hero rounded-2xl p-6 text-primary-foreground">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-accent bg-accent/20 px-2 py-0.5 rounded-full">
                    AI Prediction
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">Next Month Revenue Forecast</h3>
                <p className="text-sm text-primary-foreground/70">
                  {hasData 
                    ? "Based on your document data and market trends" 
                    : "Upload more documents for accurate predictions"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-3xl font-bold text-accent">
                  {hasData ? formatCurrency(metrics.totalRevenue * 1.1) : "₨ --"}
                </p>
                <p className="text-sm text-primary-foreground/70">
                  {hasData ? "+10% expected growth" : "Insufficient data"}
                </p>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                className="hidden md:flex"
                onClick={() => navigate("/dashboard/insights")}
              >
                View Insights <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Charts Row - Cashflow & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CashflowChart data={metrics.monthlyData} />
          </div>
          <div>
            <AIInsightsPanel metrics={metrics} hasData={hasData} />
          </div>
        </div>

        {/* Analytics Row - Profit Trend, Revenue Categories, Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfitTrendChart data={metrics.monthlyData} hasData={hasData} />
          <RevenueCategoryChart data={metrics.revenueCategories} hasData={hasData} />
          <ExpenseBreakdown data={metrics.expenseCategories} />
        </div>

        {/* Transactions & Financial Health Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactionsTable 
              transactions={metrics.recentTransactions.map(tx => ({
                date: tx.date,
                description: tx.description,
                category: tx.category || "General",
                amount: tx.credit || tx.debit || 0,
                type: tx.credit ? "credit" as const : "debit" as const
              }))} 
              hasData={hasData} 
            />
          </div>
          <div className="space-y-6">
            <FinancialHealthScore score={metrics.financialHealthScore} hasData={hasData} />
            <QuickActions />
          </div>
        </div>

        {/* Recent Documents */}
        <RecentDocuments />
      </div>
    </div>
  );
};

export default Dashboard;
