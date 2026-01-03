import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { FileText, TrendingUp } from "lucide-react";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  profit?: number;
}

interface ProfitTrendChartProps {
  data?: MonthlyData[];
  hasData: boolean;
}

const defaultData = [
  { month: "Jul", income: 450000, expenses: 320000, profit: 130000 },
  { month: "Aug", income: 520000, expenses: 380000, profit: 140000 },
  { month: "Sep", income: 480000, expenses: 350000, profit: 130000 },
  { month: "Oct", income: 610000, expenses: 420000, profit: 190000 },
  { month: "Nov", income: 580000, expenses: 400000, profit: 180000 },
  { month: "Dec", income: 720000, expenses: 480000, profit: 240000 },
];

const ProfitTrendChart = ({ data, hasData }: ProfitTrendChartProps) => {
  const chartData = hasData && data && data.length > 0 
    ? data.map(d => ({ ...d, profit: d.income - d.expenses }))
    : defaultData;

  const avgProfit = chartData.reduce((sum, d) => sum + (d.profit || 0), 0) / chartData.length;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Profit Trend</h3>
          <p className="text-sm text-muted-foreground">
            {hasData ? "Net profit performance over time" : "Sample data"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Avg:</span>
          <span className="font-semibold text-foreground">₨ {(avgProfit / 1000).toFixed(0)}K</span>
        </div>
      </div>

      {(!hasData && !data) || (data && data.length === 0) ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground">
          <FileText className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No profit data available</p>
        </div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152 69% 40%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(152 69% 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                tickFormatter={(value) => `₨${(value / 1000).toFixed(0)}K`} 
              />
              <ReferenceLine 
                y={avgProfit} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                strokeOpacity={0.5}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                }}
                formatter={(value: number) => [`₨ ${value.toLocaleString()}`, 'Profit']}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(152 69% 40%)" 
                strokeWidth={3}
                dot={{ fill: 'hsl(152 69% 40%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                fill="url(#profitGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProfitTrendChart;
