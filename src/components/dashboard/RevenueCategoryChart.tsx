import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FileText } from "lucide-react";

interface CategoryData {
  name: string;
  amount: number;
}

interface RevenueCategoryChartProps {
  data?: CategoryData[];
  hasData: boolean;
}

const defaultData = [
  { name: "Products", amount: 450000 },
  { name: "Services", amount: 280000 },
  { name: "Consulting", amount: 180000 },
  { name: "Maintenance", amount: 120000 },
];

const COLORS = [
  "hsl(38 92% 50%)",
  "hsl(222 47% 35%)",
  "hsl(152 69% 40%)",
  "hsl(199 89% 48%)",
  "hsl(280 65% 50%)",
];

const RevenueCategoryChart = ({ data, hasData }: RevenueCategoryChartProps) => {
  const chartData = hasData && data && data.length > 0 ? data : defaultData;
  const total = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue by Category</h3>
          <p className="text-sm text-muted-foreground">
            {hasData ? "Distribution from documents" : "Sample distribution"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-foreground">₨ {(total / 100000).toFixed(1)} L</p>
        </div>
      </div>

      {(!hasData && !data) || (data && data.length === 0) ? (
        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
          <FileText className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No category data</p>
        </div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis 
                type="number" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                tickFormatter={(value) => `₨${(value / 1000).toFixed(0)}K`} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                width={75} 
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: number) => [`₨ ${value.toLocaleString()}`, 'Revenue']} 
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueCategoryChart;
