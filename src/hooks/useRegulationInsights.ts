import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialData } from "./useFinancialData";
import { useDocuments } from "./useDocuments";
import { toast } from "@/hooks/use-toast";

export interface TaxObligation {
  type: "VAT" | "Income Tax" | "TDS" | "SSF" | "Other";
  status: "compliant" | "at_risk" | "non_compliant" | "needs_review";
  description: string;
  currentSituation: string;
  requiredAction: string;
  deadline?: string;
  potentialPenalty?: string;
}

export interface Risk {
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  title: string;
  description: string;
  financialImpact?: string;
  recommendation: string;
}

export interface MissingDocument {
  documentType: string;
  importance: "critical" | "important" | "recommended";
  reason: string;
  regulatoryBasis: string;
}

export interface Recommendation {
  priority: "immediate" | "short_term" | "medium_term";
  category: string;
  title: string;
  description: string;
  expectedBenefit: string;
  effort: "low" | "medium" | "high";
}

export interface Insight {
  type: "pattern" | "anomaly" | "opportunity" | "warning";
  title: string;
  description: string;
  dataPoint: string;
  suggestion: string;
}

export interface ThresholdAlert {
  threshold: string;
  currentValue: string;
  thresholdValue: string;
  status: "below" | "approaching" | "exceeded";
  implication: string;
}

export interface RegulationInsights {
  summary: {
    complianceScore: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    overallAssessment: string;
  };
  taxObligations: TaxObligation[];
  risks: Risk[];
  missingDocuments: MissingDocument[];
  recommendations: Recommendation[];
  insights: Insight[];
  thresholdAlerts: ThresholdAlert[];
}

export function useRegulationInsights() {
  const [insights, setInsights] = useState<RegulationInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  const { metrics } = useFinancialData();
  const { documents } = useDocuments();

  const analyzeRegulations = useCallback(async () => {
    if (!documents || documents.length === 0) {
      toast({
        title: "No documents to analyze",
        description: "Upload some financial documents first to get regulation insights.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("regulation-insights", {
        body: {
          documents: documents.map(doc => ({
            id: doc.id,
            file_name: doc.file_name,
            document_type: doc.document_type,
            extracted_data: doc.extracted_data,
            status: doc.status,
            created_at: doc.created_at,
          })),
          metrics: {
            totalRevenue: metrics.totalRevenue,
            totalExpenses: metrics.totalExpenses,
            vatCollected: metrics.vatCollected,
            financialHealthScore: metrics.financialHealthScore,
            monthlyData: metrics.monthlyData,
            expenseCategories: metrics.expenseCategories,
          },
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to analyze regulations");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setInsights(data);
      setLastAnalyzed(new Date());
      
      toast({
        title: "Analysis Complete",
        description: "Regulation insights have been generated based on your documents.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze regulations";
      setError(message);
      toast({
        title: "Analysis Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [documents, metrics]);

  const clearInsights = useCallback(() => {
    setInsights(null);
    setLastAnalyzed(null);
    setError(null);
  }, []);

  return {
    insights,
    isLoading,
    error,
    lastAnalyzed,
    analyzeRegulations,
    clearInsights,
    hasDocuments: documents.length > 0,
  };
}
