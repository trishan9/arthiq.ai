import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FileText } from "lucide-react";

interface CategoryData {
  name: string;
  amount: number;
}

interface ExpenseBreakdownProps {
  data?: CategoryData[];
}

const COLORS = [
  "hsl(222 47% 18%)",
  "hsl(38 92% 50%)", 
  "hsl(152 69% 40%)",
  "hsl(199 89% 48%)",
  "hsl(0 84% 60%)",
  "hsl(220 9% 46%)",
];

const defaultData = [
  { name: "Salaries", amount: 35 },
  { name: "Rent", amount: 20 },
  { name: "Inventory", amount: 25 },
  { name: "Utilities", amount: 10 },
  { name: "Marketing", amount: 5 },
  { name: "Other", amount: 5 },
];

const ExpenseBreakdown = ({ data }: ExpenseBreakdownProps) => {
  const hasRealData = data && data.length > 0;
  const chartData = hasRealData ? data : defaultData;
  const total = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Expense Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          {hasRealData ? "From your uploaded documents" : "Sample data"}
        </p>
      </div>
      
      <div className="flex items-center gap-8">
        {/* Pie Chart */}
        <div className="w-[180px] h-[180px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(220 13% 91%)',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px hsl(222 47% 11% / 0.1)',
                }}
                formatter={(value: number) => [hasRealData ? `₨${value.toLocaleString()}` : `${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-3">
          {chartData.slice(0, 6).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {hasRealData ? `${((item.amount / total) * 100).toFixed(0)}%` : `${item.amount}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseBreakdown;
