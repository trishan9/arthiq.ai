import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText } from "lucide-react";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface CashflowChartProps {
  data?: MonthlyData[];
}

const defaultData = [
  { month: "Baisakh", income: 450000, expenses: 320000 },
  { month: "Jestha", income: 520000, expenses: 380000 },
  { month: "Ashadh", income: 480000, expenses: 350000 },
  { month: "Shrawan", income: 620000, expenses: 420000 },
  { month: "Bhadra", income: 580000, expenses: 390000 },
  { month: "Ashwin", income: 710000, expenses: 450000 },
  { month: "Kartik", income: 680000, expenses: 480000 },
  { month: "Mangsir", income: 750000, expenses: 520000 },
];

const CashflowChart = ({ data }: CashflowChartProps) => {
  const hasRealData = data && data.some(d => d.income > 0 || d.expenses > 0);
  const chartData = hasRealData ? data : defaultData;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cashflow Overview</h3>
          <p className="text-sm text-muted-foreground">
            {hasRealData ? "Income vs Expenses from your documents" : "Sample data - upload documents to see real data"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152 69% 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152 69% 40%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }}
              tickFormatter={(value) => `₨${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0 0% 100%)',
                border: '1px solid hsl(220 13% 91%)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px hsl(222 47% 11% / 0.1)',
              }}
              formatter={(value: number) => [`₨${value.toLocaleString()}`, '']}
              labelStyle={{ color: 'hsl(222 47% 11%)', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(152 69% 40%)"
              strokeWidth={2}
              fill="url(#incomeGradient)"
              name="Income"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(0 84% 60%)"
              strokeWidth={2}
              fill="url(#expenseGradient)"
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashflowChart;
