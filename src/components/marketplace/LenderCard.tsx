import {
  Building2,
  CheckCircle,
  Globe,
  Mail,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Lender, EligibilityCriteria } from "@/hooks/use-market-place";
import { cn } from "@/lib/utils";

interface LenderCardProps {
  lender: Lender;
  onSelectCriteria?: (lender: Lender, criteria: EligibilityCriteria) => void;
}

const orgTypeIcons: Record<string, React.ReactNode> = {
  bank: <Building2 className="h-5 w-5" />,
  microfinance: <Users className="h-5 w-5" />,
  cooperative: <Users className="h-5 w-5" />,
  business: <Building2 className="h-5 w-5" />,
  investor: <Target className="h-5 w-5" />,
};

const orgTypeColors: Record<string, string> = {
  bank: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  microfinance: "bg-green-500/10 text-green-600 border-green-500/20",
  cooperative: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  business: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  investor: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

export function LenderCard({ lender, onSelectCriteria }: LenderCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-lg border",
                orgTypeColors[lender.organization_type]
              )}
            >
              {orgTypeIcons[lender.organization_type]}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {lender.name}
                {lender.is_verified && (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
              </CardTitle>
              <Badge variant="outline" className="mt-1 text-xs capitalize">
                {lender.organization_type.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {lender.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {lender.website && (
            <a
              href={lender.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
          {lender.contact_email && (
            <a
              href={`mailto:${lender.contact_email}`}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Mail className="h-3 w-3" />
              Contact
            </a>
          )}
        </div>

        {lender.criteria && lender.criteria.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto"
              >
                <span className="text-sm font-medium">
                  {lender.criteria.length} Eligibility{" "}
                  {lender.criteria.length === 1 ? "Criteria" : "Options"}
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {lender.criteria.map((criteria) => (
                <div
                  key={criteria.id}
                  className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{criteria.name}</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectCriteria?.(lender, criteria)}
                    >
                      View Details
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {criteria.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      Score ≥ {criteria.min_credibility_score}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Tier ≥ {criteria.min_trust_tier}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {criteria.required_document_types.length} docs required
                    </Badge>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
