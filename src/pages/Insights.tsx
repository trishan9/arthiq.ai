import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, FileText, Brain, Shield } from "lucide-react";
import { useRegulationInsights } from "@/hooks/useRegulationInsights";
import { ComplianceScoreCard } from "@/components/insights/ComplianceScoreCard";
import { TaxObligationsCard } from "@/components/insights/TaxObligationsCard";
import { RisksCard } from "@/components/insights/RisksCard";
import { MissingDocumentsCard } from "@/components/insights/MissingDocumentsCard";
import { RecommendationsCard } from "@/components/insights/RecommendationsCard";
import { InsightsCard } from "@/components/insights/InsightsCard";
import { ThresholdAlertsCard } from "@/components/insights/ThresholdAlertsCard";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const Insights = () => {
  const navigate = useNavigate();
  const {
    insights,
    isLoading,
    error,
    lastAnalyzed,
    analyzeRegulations,
    hasDocuments,
  } = useRegulationInsights();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <DashboardHeader
        title="Regulation Insights"
        subtitle="AI-powered compliance analysis based on Nepal's tax & regulatory framework"
      />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Nepal Regulatory Compliance</h3>
            <p className="text-sm text-muted-foreground">
              {lastAnalyzed
                ? `Last analyzed: ${format(lastAnalyzed, "PPp")}`
                : "Run analysis to get insights"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasDocuments && (
            <Button variant="outline" onClick={() => navigate("/dashboard/documents")}>
              <FileText className="h-4 w-4 mr-2" />
              Upload Documents First
            </Button>
          )}
          <Button
            onClick={analyzeRegulations}
            disabled={isLoading || !hasDocuments}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {insights ? "Re-analyze" : "Analyze Regulations"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!insights && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Regulation-Aware Financial Insights
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Our AI analyzes your uploaded documents against Nepal's tax regulations, 
              VAT requirements, and compliance frameworks to provide actionable insights.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 max-w-sm mx-auto text-left mb-6">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Tax & VAT obligation tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Compliance risk identification
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Missing document detection
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Regulatory threshold monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Actionable recommendations
              </li>
            </ul>
            {hasDocuments ? (
              <Button onClick={analyzeRegulations} size="lg">
                <Brain className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            ) : (
              <Button onClick={() => navigate("/dashboard/documents")} size="lg">
                <FileText className="h-4 w-4 mr-2" />
                Upload Documents to Begin
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analyzing Your Documents</h3>
            <p className="text-muted-foreground">
              Checking against Nepal's tax regulations, VAT requirements, and compliance frameworks...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {insights && !isLoading && (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ComplianceScoreCard
              score={insights.summary.complianceScore}
              riskLevel={insights.summary.riskLevel}
              assessment={insights.summary.overallAssessment}
            />
            <ThresholdAlertsCard alerts={insights.thresholdAlerts} />
          </div>

          {/* Tax Obligations */}
          <TaxObligationsCard obligations={insights.taxObligations} />

          {/* Risks & Missing Docs */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RisksCard risks={insights.risks} />
            <MissingDocumentsCard missingDocuments={insights.missingDocuments} />
          </div>

          {/* Insights */}
          <InsightsCard insights={insights.insights} />

          {/* Recommendations */}
          <RecommendationsCard recommendations={insights.recommendations} />

          {/* Disclaimer */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                ⚠️ <strong>Disclaimer:</strong> These insights are for decision intelligence purposes only, 
                not compliance enforcement. Always consult with a qualified tax professional or chartered 
                accountant for official tax filing and regulatory compliance in Nepal.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Insights;
