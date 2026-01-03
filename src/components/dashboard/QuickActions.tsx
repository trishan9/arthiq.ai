import { Upload, FileText, MessageSquare, Shield, TrendingUp, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    icon: Upload,
    label: "Upload Documents",
    description: "Add new financial documents",
    href: "/dashboard/documents",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: MessageSquare,
    label: "Ask AI Assistant",
    description: "Get instant financial insights",
    href: "/dashboard/assistant",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: FileText,
    label: "Generate Report",
    description: "Create loan or tax reports",
    href: "/dashboard/reports",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Shield,
    label: "Verify Credibility",
    description: "Create blockchain proof",
    href: "/dashboard/credibility",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: TrendingUp,
    label: "View Analytics",
    description: "See financial trends",
    href: "/dashboard/analytics",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Calculator,
    label: "Tax Calculator",
    description: "Estimate your tax liability",
    href: "/dashboard/reports",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

const QuickActions = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className="group p-4 rounded-xl border border-border hover:border-accent/30 hover:shadow-card transition-all duration-300"
          >
            <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <p className="font-medium text-foreground text-sm mb-0.5">{action.label}</p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
