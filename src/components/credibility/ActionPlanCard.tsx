import { Target, ArrowRight, Zap, Clock, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImprovementAction } from "@/hooks/use-credibility-score";
import { useNavigate } from "react-router-dom";

interface ActionPlanCardProps {
  actions: ImprovementAction[];
}

const priorityConfig = {
  immediate: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    icon: Zap,
    label: "Do Now",
  },
  short_term: {
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: Clock,
    label: "This Week",
  },
  medium_term: {
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
    icon: Calendar,
    label: "This Month",
  },
};

const categoryConfig = {
  evidence: { label: "Evidence", route: "/dashboard/documents" },
  stability: { label: "Financial", route: "/dashboard" },
  compliance: { label: "Compliance", route: "/dashboard/insights" },
  verification: { label: "Verification", route: "/dashboard/credibility" },
};

const effortConfig = {
  low: { label: "Easy", color: "text-success" },
  medium: { label: "Moderate", color: "text-accent" },
  high: { label: "Significant", color: "text-warning" },
};

export function ActionPlanCard({ actions }: ActionPlanCardProps) {
  const navigate = useNavigate();

  const topActions = actions.slice(0, 5);

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-lg">Action Plan</CardTitle>
              <p className="text-sm text-muted-foreground">
                Steps to improve your score
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-success" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">
              Excellent Standing!
            </h4>
            <p className="text-sm text-muted-foreground">
              You've completed all recommended actions. Keep maintaining your
              financial records.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Action Plan</CardTitle>
              <p className="text-sm text-muted-foreground">
                {actions.length} action{actions.length > 1 ? "s" : ""} to
                improve your score
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-accent bg-accent/10">
            +{actions.reduce((sum, a) => sum + a.potentialGain, 0)} pts
            potential
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {topActions.map((action, i) => {
          const priority = priorityConfig[action.priority];
          const category = categoryConfig[action.category];
          const effort = effortConfig[action.effort];
          const PriorityIcon = priority.icon;

          return (
            <div
              key={i}
              className={`p-4 rounded-xl border ${priority.border} ${priority.bg} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg ${priority.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <PriorityIcon className={`w-4 h-4 ${priority.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground text-sm">
                      {action.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      +{action.potentialGain} pts
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`${priority.color} font-medium`}>
                      {priority.label}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {category.label}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className={effort.color}>{effort.label} effort</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => navigate(category.route)}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {actions.length > 5 && (
          <Button variant="outline" className="w-full">
            View All {actions.length} Actions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
