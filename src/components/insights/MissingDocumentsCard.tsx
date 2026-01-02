import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileX, Upload, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { MissingDocument } from "@/hooks/useRegulationInsights";

interface MissingDocumentsCardProps {
  missingDocuments: MissingDocument[];
}

const importanceConfig = {
  critical: {
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: AlertCircle,
  },
  important: {
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    icon: AlertCircle,
  },
  recommended: {
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: Info,
  },
};

export function MissingDocumentsCard({ missingDocuments }: MissingDocumentsCardProps) {
  const navigate = useNavigate();

  if (!missingDocuments || missingDocuments.length === 0) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileX className="h-5 w-5 text-green-500" />
            Document Completeness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">All required documents are present! ✓</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by importance
  const sortedDocs = [...missingDocuments].sort((a, b) => {
    const order = { critical: 0, important: 1, recommended: 2 };
    return order[a.importance] - order[b.importance];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileX className="h-5 w-5 text-primary" />
            Missing Documents
          </div>
          <Button size="sm" onClick={() => navigate("/dashboard/documents")}>
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedDocs.map((doc, index) => {
          const config = importanceConfig[doc.importance];
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border border-border/50",
                config.bgColor
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{doc.documentType}</h4>
                    <Badge variant="outline" className={config.color}>
                      {doc.importance}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{doc.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    📋 {doc.regulatoryBasis}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
