import { useMemo } from "react";
import { useFinancialData, FinancialMetrics } from "./useFinancialData";
import { useDocuments } from "./useDocuments";
import { useVerificationProofs } from "./useVerificationProofs";

export type TrustTier = 0 | 1 | 2 | 3;
export type TrustTierLabel =
  | "Self-Declared"
  | "Document-Backed"
  | "Bank-Supported"
  | "Verified";

export interface TierRequirement {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  progress?: number; // 0-100 for partial progress
  weight: number; // importance weight
}

export interface TrustTierInfo {
  tier: TrustTier;
  label: TrustTierLabel;
  description: string;
  requirements: string[];
  nextTierRequirements?: string[];
  detailedRequirements: TierRequirement[];
  tierProgress: number;
  antifraudScore: number;
  verificationStrength: "weak" | "moderate" | "strong" | "verified";
}

// Layer Scores
export interface EvidenceQualityScore {
  score: number; // 0-100
  documentBackedRatio: number; // % of entries backed by documents vs manual
  consistencyScore: number; // cross-source matching score
  continuityScore: number; // monthly evidence coverage
  metadataScore: number; // file quality, duplicates detection
  flags: EvidenceFlag[];
}

export interface StabilityGrowthScore {
  score: number; // 0-100
  revenueStability: number; // variance measure (lower is better)
  cashflowHealth: number; // runway assessment
  expenseDiscipline: number; // expense/revenue ratio control
  growthTrend: number; // consistent growth indicator
  seasonalityHandling: number; // adapts to Nepali fiscal patterns
  flags: StabilityFlag[];
}

export interface ComplianceReadinessScore {
  score: number; // 0-100
  documentCompleteness: number; // required docs by business type
  riskPatterns: number; // mismatch ratios, unusual patterns
  timelinessScore: number; // monthly cadence of records
  advisoryCompletion: number; // recommended actions done
  flags: ComplianceFlag[];
}

// Flags for anti-fraud
export interface EvidenceFlag {
  type: "warning" | "critical" | "info";
  code: string;
  message: string;
  impact: number; // score reduction
}

export interface StabilityFlag {
  type: "warning" | "critical" | "info" | "positive";
  code: string;
  message: string;
  impact: number;
}

export interface ComplianceFlag {
  type: "warning" | "critical" | "info";
  code: string;
  message: string;
  recommendation: string;
}

// Anomaly Detection - Enhanced for Phase 2
export type AnomalyType =
  | "REVENUE_SPIKE"
  | "ROUND_NUMBERS"
  | "REPEATED_AMOUNTS"
  | "DATE_INCONSISTENCY"
  | "TEMPLATE_DETECTION"
  | "VELOCITY_ANOMALY"
  | "TIMING_MISMATCH"
  | "METADATA_SUSPICIOUS"
  | "PATTERN_ANOMALY"
  | "CROSS_SOURCE_MISMATCH";

export interface AnomalyAlert {
  severity: "low" | "medium" | "high" | "critical";
  type: AnomalyType;
  category: "behavioral" | "data_quality" | "cross_validation" | "timing";
  description: string;
  dataPoints: string[];
  confidenceReduction: number;
  recommendation: string;
  detectionMethod: string;
}

// Main Credibility Score
export interface CredibilityScore {
  // Overall
  totalScore: number; // 0-100
  confidenceLevel: "high" | "medium" | "low";
  trustTier: TrustTierInfo;

  // Layer Breakdown
  evidenceQuality: EvidenceQualityScore;
  stabilityGrowth: StabilityGrowthScore;
  complianceReadiness: ComplianceReadinessScore;

  // Anti-Fraud
  anomalies: AnomalyAlert[];
  crossSourceReconciliation: {
    passed: boolean;
    mismatches: string[];
    reconciliationScore: number;
  };

  // Actions
  improvementActions: ImprovementAction[];

  // Meta
  lastCalculated: Date;
  dataPoints: number;
}

export interface ImprovementAction {
  priority: "immediate" | "short_term" | "medium_term";
  category: "evidence" | "stability" | "compliance" | "verification";
  title: string;
  description: string;
  potentialGain: number; // points
  effort: "low" | "medium" | "high";
}

export function useCredibilityScore() {
  const { metrics, isLoading: metricsLoading, hasData } = useFinancialData();
  const { documents } = useDocuments();
  const { proofs } = useVerificationProofs();

  const credibilityScore = useMemo<CredibilityScore>(() => {
    // Calculate Evidence Quality Score (Layer A)
    const evidenceQuality = calculateEvidenceQuality(documents, metrics);

    // Calculate Stability & Growth Score (Layer B)
    const stabilityGrowth = calculateStabilityGrowth(metrics);

    // Calculate Compliance Readiness Score (Layer C)
    const complianceReadiness = calculateComplianceReadiness(
      documents,
      metrics
    );

    // Detect anomalies
    const anomalies = detectAnomalies(documents, metrics);

    // Cross-source reconciliation
    const reconciliation = performReconciliation(documents, metrics);

    // Calculate trust tier with enhanced anti-fraud parameters
    const trustTier = calculateTrustTier(
      documents,
      proofs,
      evidenceQuality.score,
      anomalies,
      reconciliation
    );

    // Calculate confidence level based on anomalies and data quality
    const confidenceLevel = calculateConfidence(
      anomalies,
      evidenceQuality,
      reconciliation
    );

    // Final score calculation: Evidence Quality × (Stability + Growth + Compliance) / 3
    // Low evidence quality caps the total score
    const layerAverage =
      (stabilityGrowth.score + complianceReadiness.score) / 2;
    const evidenceMultiplier = evidenceQuality.score / 100;
    const rawScore = layerAverage * evidenceMultiplier;

    // Apply anomaly penalties
    const anomalyPenalty = anomalies.reduce(
      (sum, a) => sum + a.confidenceReduction,
      0
    );
    const totalScore = Math.max(
      0,
      Math.min(100, Math.round(rawScore - anomalyPenalty))
    );

    // Generate improvement actions
    const improvementActions = generateImprovementActions(
      evidenceQuality,
      stabilityGrowth,
      complianceReadiness,
      trustTier,
      anomalies
    );

    return {
      totalScore,
      confidenceLevel,
      trustTier,
      evidenceQuality,
      stabilityGrowth,
      complianceReadiness,
      anomalies,
      crossSourceReconciliation: reconciliation,
      improvementActions,
      lastCalculated: new Date(),
      dataPoints: documents.length,
    };
  }, [documents, metrics, proofs]);

  return {
    credibilityScore,
    isLoading: metricsLoading,
    hasData,
    metrics,
  };
}

// Layer A: Evidence Quality
function calculateEvidenceQuality(
  documents: any[],
  metrics: FinancialMetrics
): EvidenceQualityScore {
  const flags: EvidenceFlag[] = [];

  if (documents.length === 0) {
    return {
      score: 0,
      documentBackedRatio: 0,
      consistencyScore: 0,
      continuityScore: 0,
      metadataScore: 0,
      flags: [
        {
          type: "critical",
          code: "NO_DOCUMENTS",
          message: "No documents uploaded",
          impact: 100,
        },
      ],
    };
  }

  const processedDocs = documents.filter((d) => d.status === "processed");
  const manualEntries = documents.filter(
    (d) =>
      d.document_type === "manual_entry" || d.file_path?.startsWith("manual://")
  );
  const bankStatements = documents.filter(
    (d) => d.document_type === "bank_statement"
  );
  const invoices = documents.filter((d) => d.document_type === "invoice");
  const receipts = documents.filter((d) => d.document_type === "receipt");

  // Document-backed ratio (60% weight)
  // Bank statements > Invoices/Receipts > Manual entries
  const totalEntries = documents.length;
  const documentBacked =
    bankStatements.length * 3 + invoices.length * 2 + receipts.length * 2;
  const manualWeight = manualEntries.length * 0.5;
  const maxPossible = totalEntries * 3;
  const documentBackedRatio =
    maxPossible > 0
      ? Math.min(100, ((documentBacked + manualWeight) / maxPossible) * 100)
      : 0;

  if (manualEntries.length > documents.length * 0.5) {
    flags.push({
      type: "warning",
      code: "HIGH_MANUAL_RATIO",
      message: "Over 50% of entries are manual - add supporting documents",
      impact: 15,
    });
  }

  // Consistency score (20% weight) - check for duplicates, conflicting data
  let consistencyScore = 80;
  const fileNames = documents
    .map((d) => d.file_name?.toLowerCase())
    .filter(Boolean);
  const uniqueNames = new Set(fileNames);
  if (uniqueNames.size < fileNames.length * 0.9) {
    consistencyScore -= 20;
    flags.push({
      type: "warning",
      code: "DUPLICATE_FILES",
      message: "Potential duplicate files detected",
      impact: 10,
    });
  }
  consistencyScore = Math.max(0, consistencyScore);

  // Continuity score (15% weight) - monthly evidence coverage
  const monthsWithData = new Set<string>();
  documents.forEach((doc) => {
    if (doc.created_at) {
      monthsWithData.add(doc.created_at.substring(0, 7));
    }
  });
  const continuityScore = Math.min(100, (monthsWithData.size / 6) * 100); // 6 months = 100%

  if (monthsWithData.size < 3) {
    flags.push({
      type: "info",
      code: "LIMITED_HISTORY",
      message: "Less than 3 months of financial history",
      impact: 5,
    });
  }

  // Metadata score (5% weight)
  const metadataScore =
    processedDocs.length === documents.length
      ? 100
      : (processedDocs.length / documents.length) * 100;

  // Weighted final score
  const score = Math.round(
    documentBackedRatio * 0.6 +
      consistencyScore * 0.2 +
      continuityScore * 0.15 +
      metadataScore * 0.05
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    documentBackedRatio,
    consistencyScore,
    continuityScore,
    metadataScore,
    flags,
  };
}

// Layer B: Stability & Growth
function calculateStabilityGrowth(
  metrics: FinancialMetrics
): StabilityGrowthScore {
  const flags: StabilityFlag[] = [];

  if (metrics.monthlyData.length === 0) {
    return {
      score: 0,
      revenueStability: 0,
      cashflowHealth: 0,
      expenseDiscipline: 0,
      growthTrend: 0,
      seasonalityHandling: 50,
      flags: [
        {
          type: "warning",
          code: "NO_MONTHLY_DATA",
          message: "No monthly data available",
          impact: 0,
        },
      ],
    };
  }

  // Revenue Stability (25% weight) - lower variance is better
  const revenues = metrics.monthlyData.map((m) => m.income);
  const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
  const revenueVariance =
    revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) /
    revenues.length;
  const coefficientOfVariation =
    avgRevenue > 0 ? Math.sqrt(revenueVariance) / avgRevenue : 1;
  const revenueStability = Math.max(0, 100 - coefficientOfVariation * 100);

  if (coefficientOfVariation > 0.5) {
    flags.push({
      type: "warning",
      code: "HIGH_REVENUE_VOLATILITY",
      message: "Revenue shows high month-to-month volatility",
      impact: -10,
    });
  }

  // Cashflow Health (25% weight)
  const netCashflow = metrics.totalRevenue - metrics.totalExpenses;
  const cashflowRatio =
    metrics.totalRevenue > 0 ? netCashflow / metrics.totalRevenue : 0;
  const cashflowHealth = Math.min(100, Math.max(0, 50 + cashflowRatio * 100));

  if (netCashflow < 0) {
    flags.push({
      type: "critical",
      code: "NEGATIVE_CASHFLOW",
      message: "Business is operating at a loss",
      impact: -25,
    });
  } else if (cashflowRatio > 0.2) {
    flags.push({
      type: "positive",
      code: "HEALTHY_MARGINS",
      message: "Healthy profit margins detected",
      impact: 5,
    });
  }

  // Expense Discipline (20% weight)
  const expenseRatio =
    metrics.totalRevenue > 0 ? metrics.totalExpenses / metrics.totalRevenue : 1;
  const expenseDiscipline = Math.max(0, 100 - expenseRatio * 80); // 80% expense ratio = 36 score

  if (expenseRatio > 0.9) {
    flags.push({
      type: "warning",
      code: "HIGH_EXPENSE_RATIO",
      message: "Expenses exceed 90% of revenue",
      impact: -10,
    });
  }

  // Growth Trend (20% weight)
  let growthTrend = 50; // neutral
  if (metrics.monthlyData.length >= 3) {
    const recentMonths = metrics.monthlyData.slice(-3);
    const olderMonths = metrics.monthlyData.slice(
      0,
      Math.max(1, metrics.monthlyData.length - 3)
    );
    const recentAvg =
      recentMonths.reduce((sum, m) => sum + m.income, 0) / recentMonths.length;
    const olderAvg =
      olderMonths.reduce((sum, m) => sum + m.income, 0) / olderMonths.length;

    if (olderAvg > 0) {
      const growthRate = (recentAvg - olderAvg) / olderAvg;
      growthTrend = Math.min(100, Math.max(0, 50 + growthRate * 100));

      if (growthRate > 0.2) {
        flags.push({
          type: "positive",
          code: "STRONG_GROWTH",
          message: "Strong revenue growth trend detected",
          impact: 10,
        });
      } else if (growthRate < -0.2) {
        flags.push({
          type: "warning",
          code: "DECLINING_REVENUE",
          message: "Revenue shows declining trend",
          impact: -15,
        });
      }
    }
  }

  // Seasonality Handling (10% weight) - check for Nepali fiscal patterns (Dashain/Tihar)
  const seasonalityHandling = 70; // Assume reasonable for now

  // Weighted score
  const score = Math.round(
    revenueStability * 0.25 +
      cashflowHealth * 0.25 +
      expenseDiscipline * 0.2 +
      growthTrend * 0.2 +
      seasonalityHandling * 0.1
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    revenueStability,
    cashflowHealth,
    expenseDiscipline,
    growthTrend,
    seasonalityHandling,
    flags,
  };
}

// Layer C: Compliance Readiness
function calculateComplianceReadiness(
  documents: any[],
  metrics: FinancialMetrics
): ComplianceReadinessScore {
  const flags: ComplianceFlag[] = [];

  // Document Completeness (40% weight)
  const hasInvoices = documents.some((d) => d.document_type === "invoice");
  const hasBankStatements = documents.some(
    (d) => d.document_type === "bank_statement"
  );
  const hasReceipts = documents.some((d) => d.document_type === "receipt");
  const hasProfitLoss = documents.some(
    (d) => d.document_type === "profit_loss"
  );
  const hasBalanceSheet = documents.some(
    (d) => d.document_type === "balance_sheet"
  );
  const hasTaxDocs = documents.some((d) => d.document_type === "tax_document");

  const requiredDocs = [hasInvoices, hasBankStatements, hasReceipts];
  const recommendedDocs = [hasProfitLoss, hasBalanceSheet, hasTaxDocs];

  const requiredComplete =
    (requiredDocs.filter(Boolean).length / requiredDocs.length) * 70;
  const recommendedComplete =
    (recommendedDocs.filter(Boolean).length / recommendedDocs.length) * 30;
  const documentCompleteness = requiredComplete + recommendedComplete;

  if (!hasInvoices) {
    flags.push({
      type: "warning",
      code: "MISSING_INVOICES",
      message: "No sales invoices uploaded",
      recommendation: "Upload sales invoices to prove revenue",
    });
  }
  if (!hasBankStatements) {
    flags.push({
      type: "warning",
      code: "MISSING_BANK_STATEMENTS",
      message: "No bank statements uploaded",
      recommendation: "Add bank statements for Tier 2 verification",
    });
  }

  // Risk Patterns (30% weight) - check for unusual patterns
  let riskPatterns = 80; // Start optimistic

  // Check VAT compliance
  if (metrics.totalRevenue > 5000000 && metrics.vatCollected === 0) {
    riskPatterns -= 30;
    flags.push({
      type: "critical",
      code: "VAT_COMPLIANCE_RISK",
      message: "Revenue exceeds NPR 50L threshold but no VAT collected",
      recommendation: "Ensure VAT registration and proper collection",
    });
  }

  // Check expense to revenue ratio sanity
  if (metrics.totalExpenses > metrics.totalRevenue * 1.5) {
    riskPatterns -= 20;
    flags.push({
      type: "warning",
      code: "EXPENSE_ANOMALY",
      message: "Expenses significantly exceed revenue",
      recommendation: "Review expense categorization and documentation",
    });
  }

  riskPatterns = Math.max(0, riskPatterns);

  // Timeliness Score (20% weight)
  const recentDocs = documents.filter((d) => {
    const docDate = new Date(d.created_at);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return docDate > threeMonthsAgo;
  });
  const timelinessScore = Math.min(
    100,
    (recentDocs.length / Math.max(1, documents.length)) * 150
  );

  // Advisory Completion (10% weight)
  const advisoryCompletion = 50; // Would track completed recommendations

  // Weighted score
  const score = Math.round(
    documentCompleteness * 0.4 +
      riskPatterns * 0.3 +
      timelinessScore * 0.2 +
      advisoryCompletion * 0.1
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    documentCompleteness,
    riskPatterns,
    timelinessScore,
    advisoryCompletion,
    flags,
  };
}

// Enhanced Anomaly Detection - Phase 2
function detectAnomalies(
  documents: any[],
  metrics: FinancialMetrics
): AnomalyAlert[] {
  const anomalies: AnomalyAlert[] = [];

  // 1. REVENUE SPIKE DETECTION
  if (metrics.monthlyData.length >= 3) {
    const lastMonth = metrics.monthlyData[metrics.monthlyData.length - 1];
    const avgPrevious =
      metrics.monthlyData.slice(0, -1).reduce((sum, m) => sum + m.income, 0) /
      (metrics.monthlyData.length - 1);

    if (lastMonth.income > avgPrevious * 3) {
      anomalies.push({
        severity: "high",
        type: "REVENUE_SPIKE",
        category: "behavioral",
        description:
          "Sudden 3x+ revenue spike in latest month - may indicate inflated figures",
        dataPoints: [
          `Current: NPR ${lastMonth.income.toLocaleString()}`,
          `Average: NPR ${avgPrevious.toLocaleString()}`,
        ],
        confidenceReduction: 15,
        recommendation:
          "Provide supporting documents (contracts, invoices) for the revenue increase",
        detectionMethod: "Statistical deviation analysis",
      });
    }
  }

  // 2. ROUND NUMBERS DETECTION
  const roundNumberDocs = documents.filter((d) => {
    const data = d.extracted_data as Record<string, unknown>;
    if (!data) return false;
    const amount = Number(data.total_amount) || Number(data.total_revenue) || 0;
    return amount > 0 && amount % 10000 === 0;
  });

  if (roundNumberDocs.length > documents.length * 0.5 && documents.length > 3) {
    anomalies.push({
      severity: "medium",
      type: "ROUND_NUMBERS",
      category: "data_quality",
      description:
        "Over 50% of amounts are suspiciously round - typical of fabricated entries",
      dataPoints: [
        `${roundNumberDocs.length} of ${documents.length} documents have round amounts`,
      ],
      confidenceReduction: 10,
      recommendation:
        "Upload original invoices/receipts with actual transaction amounts",
      detectionMethod: "Round number frequency analysis",
    });
  }

  // 3. REPEATED AMOUNTS DETECTION (Template Detection)
  const amounts = documents
    .map((d) => {
      const data = d.extracted_data as Record<string, unknown>;
      return Number(data?.total_amount) || 0;
    })
    .filter((a) => a > 0);

  const amountCounts = amounts.reduce((acc, a) => {
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const repeatedAmounts = Object.entries(amountCounts).filter(
    ([, count]) => (count as number) > 2
  );
  if (repeatedAmounts.length > 0 && documents.length > 5) {
    anomalies.push({
      severity: "low",
      type: "REPEATED_AMOUNTS",
      category: "data_quality",
      description:
        "Multiple documents with identical amounts - possible template-based entries",
      dataPoints: repeatedAmounts.map(
        ([amt, cnt]) =>
          `NPR ${Number(amt).toLocaleString()} appears ${cnt} times`
      ),
      confidenceReduction: 5,
      recommendation: "Verify these are legitimate recurring transactions",
      detectionMethod: "Duplicate amount clustering",
    });
  }

  // 4. DATE INCONSISTENCY DETECTION
  const docDates = documents
    .map((d) => {
      const data = d.extracted_data as Record<string, unknown>;
      const docDate =
        data?.date || data?.invoice_date || data?.transaction_date;
      const uploadDate = d.created_at;
      return { docDate, uploadDate, fileName: d.file_name };
    })
    .filter((d) => d.docDate);

  const futureDatedDocs = docDates.filter((d) => {
    const docDateParsed = new Date(d.docDate as string);
    return docDateParsed > new Date();
  });

  if (futureDatedDocs.length > 0) {
    anomalies.push({
      severity: "critical",
      type: "DATE_INCONSISTENCY",
      category: "timing",
      description:
        "Documents dated in the future - clear indication of fabrication",
      dataPoints: futureDatedDocs.map(
        (d) => `${d.fileName}: dated ${d.docDate}`
      ),
      confidenceReduction: 25,
      recommendation: "Remove or correct future-dated documents immediately",
      detectionMethod: "Temporal validation",
    });
  }

  // 5. VELOCITY ANOMALY - Too many documents uploaded in short time
  const uploadTimes = documents.map((d) => new Date(d.created_at).getTime());
  if (uploadTimes.length >= 10) {
    const sortedTimes = [...uploadTimes].sort((a, b) => a - b);
    const timeSpan = sortedTimes[sortedTimes.length - 1] - sortedTimes[0];
    const hoursSpan = timeSpan / (1000 * 60 * 60);

    if (hoursSpan < 1 && documents.length > 20) {
      anomalies.push({
        severity: "medium",
        type: "VELOCITY_ANOMALY",
        category: "behavioral",
        description:
          "Large volume of documents uploaded in very short time - unusual pattern",
        dataPoints: [
          `${documents.length} documents in ${hoursSpan.toFixed(1)} hours`,
        ],
        confidenceReduction: 8,
        recommendation:
          "This is flagged for review - provide explanation if legitimate bulk upload",
        detectionMethod: "Upload velocity analysis",
      });
    }
  }

  // 6. TIMING MISMATCH - Sales patterns vs deposit timing
  const invoices = documents.filter((d) => d.document_type === "invoice");
  const bankStatements = documents.filter(
    (d) => d.document_type === "bank_statement"
  );

  if (invoices.length > 5 && bankStatements.length > 0) {
    const invoiceDates = invoices
      .map((d) => {
        const data = d.extracted_data as Record<string, unknown>;
        return data?.date || data?.invoice_date;
      })
      .filter(Boolean);

    // Check if invoice dates cluster unnaturally (e.g., all end of month)
    const dayOfMonth = invoiceDates.map((d) => new Date(d as string).getDate());
    const endOfMonthCount = dayOfMonth.filter((d) => d >= 28).length;

    if (endOfMonthCount > invoiceDates.length * 0.7) {
      anomalies.push({
        severity: "low",
        type: "TIMING_MISMATCH",
        category: "timing",
        description:
          "Most invoices dated at month-end - unusual for normal business operations",
        dataPoints: [
          `${endOfMonthCount} of ${invoiceDates.length} invoices dated after 28th`,
        ],
        confidenceReduction: 5,
        recommendation:
          "This pattern is noted - ensure invoices reflect actual transaction dates",
        detectionMethod: "Date distribution analysis",
      });
    }
  }

  // 7. METADATA SUSPICIOUS - File creation patterns
  const fileMetadata = documents.map((d) => ({
    fileName: d.file_name,
    fileSize: d.file_size,
    fileType: d.file_type,
  }));

  // Check for suspiciously similar file sizes (potential duplicates with modified names)
  const fileSizes = fileMetadata.map((f) => f.fileSize);
  const sizeGroups: Record<number, number> = {};
  fileSizes.forEach((size) => {
    const roundedSize = Math.round(size / 100) * 100; // Group by ~100 byte ranges
    sizeGroups[roundedSize] = (sizeGroups[roundedSize] || 0) + 1;
  });

  const suspiciousGroups = Object.entries(sizeGroups).filter(
    ([, count]) => (count as number) > 3
  );
  if (suspiciousGroups.length > 2 && documents.length > 10) {
    anomalies.push({
      severity: "low",
      type: "METADATA_SUSPICIOUS",
      category: "data_quality",
      description:
        "Multiple files with nearly identical sizes - possible template modifications",
      dataPoints: [
        `${suspiciousGroups.length} groups of similar-sized files detected`,
      ],
      confidenceReduction: 5,
      recommendation: "Ensure documents are unique and not modified copies",
      detectionMethod: "File metadata analysis",
    });
  }

  // 8. PATTERN ANOMALY - Expense vs Revenue ratio unrealistic
  if (metrics.totalRevenue > 0 && metrics.totalExpenses > 0) {
    const expenseRatio = metrics.totalExpenses / metrics.totalRevenue;

    // Flag if expenses are less than 30% of revenue (unrealistically profitable)
    if (expenseRatio < 0.3 && metrics.totalRevenue > 500000) {
      anomalies.push({
        severity: "medium",
        type: "PATTERN_ANOMALY",
        category: "behavioral",
        description:
          "Unusually high profit margins (>70%) - may indicate underreported expenses",
        dataPoints: [
          `Expense ratio: ${(expenseRatio * 100).toFixed(1)}%`,
          `Expected: 40-80% for most businesses`,
        ],
        confidenceReduction: 8,
        recommendation:
          "Upload expense receipts and invoices to verify expense reporting",
        detectionMethod: "Financial ratio analysis",
      });
    }

    // Flag if expenses significantly exceed revenue with no clear explanation
    if (expenseRatio > 1.5 && metrics.totalRevenue > 100000) {
      anomalies.push({
        severity: "high",
        type: "PATTERN_ANOMALY",
        category: "behavioral",
        description:
          "Expenses 50%+ higher than revenue - unusual unless in startup/investment phase",
        dataPoints: [
          `Expenses: NPR ${metrics.totalExpenses.toLocaleString()}`,
          `Revenue: NPR ${metrics.totalRevenue.toLocaleString()}`,
        ],
        confidenceReduction: 12,
        recommendation:
          "Provide explanation or documentation for the expense-to-revenue imbalance",
        detectionMethod: "Financial ratio analysis",
      });
    }
  }

  return anomalies;
}

// Cross-source Reconciliation
function performReconciliation(
  documents: any[],
  metrics: FinancialMetrics
): {
  passed: boolean;
  mismatches: string[];
  reconciliationScore: number;
} {
  const mismatches: string[] = [];

  // Compare invoice totals vs bank deposits
  const invoiceTotal = documents
    .filter((d) => d.document_type === "invoice")
    .reduce((sum, d) => {
      const data = d.extracted_data as Record<string, any>;
      return sum + (data?.total_amount || 0);
    }, 0);

  const bankCredits = documents
    .filter((d) => d.document_type === "bank_statement")
    .reduce((sum, d) => {
      const data = d.extracted_data as Record<string, any>;
      return sum + (data?.total_credits || 0);
    }, 0);

  if (invoiceTotal > 0 && bankCredits > 0) {
    const discrepancy =
      Math.abs(invoiceTotal - bankCredits) /
      Math.max(invoiceTotal, bankCredits);
    if (discrepancy > 0.3) {
      mismatches.push(
        `Invoice total (NPR ${invoiceTotal.toLocaleString()}) differs significantly from bank deposits (NPR ${bankCredits.toLocaleString()})`
      );
    }
  }

  // Compare receipt totals vs bank debits
  const receiptTotal = documents
    .filter((d) => d.document_type === "receipt")
    .reduce((sum, d) => {
      const data = d.extracted_data as Record<string, any>;
      return sum + (data?.total_amount || 0);
    }, 0);

  const bankDebits = documents
    .filter((d) => d.document_type === "bank_statement")
    .reduce((sum, d) => {
      const data = d.extracted_data as Record<string, any>;
      return sum + (data?.total_debits || 0);
    }, 0);

  if (receiptTotal > 0 && bankDebits > 0) {
    const discrepancy =
      Math.abs(receiptTotal - bankDebits) / Math.max(receiptTotal, bankDebits);
    if (discrepancy > 0.3) {
      mismatches.push(
        `Receipt total (NPR ${receiptTotal.toLocaleString()}) differs significantly from bank payments (NPR ${bankDebits.toLocaleString()})`
      );
    }
  }

  const reconciliationScore = Math.max(0, 100 - mismatches.length * 25);

  return {
    passed: mismatches.length === 0,
    mismatches,
    reconciliationScore,
  };
}

function calculateTrustTier(
  documents: any[],
  proofs: any[],
  evidenceScore: number,
  anomalies?: AnomalyAlert[],
  reconciliation?: { reconciliationScore: number }
): TrustTierInfo {
  // Count document types
  const bankStatements = documents.filter(
    (d) => d.document_type === "bank_statement" && d.status === "processed"
  );
  const invoices = documents.filter(
    (d) => d.document_type === "invoice" && d.status === "processed"
  );
  const receipts = documents.filter(
    (d) => d.document_type === "receipt" && d.status === "processed"
  );
  const processedDocs = documents.filter(
    (d) => d.document_type !== "manual_entry" && d.status === "processed"
  );
  const activeProofs = proofs.filter((p) => p.status === "active");
  const blockchainVerified = proofs.filter(
    (p) => p.status === "active" && p.tx_hash
  );

  // Calculate months of data
  const monthsWithData = new Set(
    documents.map((d) => d.created_at?.substring(0, 7)).filter(Boolean)
  );

  // Anti-fraud score (higher = cleaner data)
  const criticalAnomalies =
    anomalies?.filter((a) => a.severity === "critical").length || 0;
  const highAnomalies =
    anomalies?.filter((a) => a.severity === "high").length || 0;
  const mediumAnomalies =
    anomalies?.filter((a) => a.severity === "medium").length || 0;
  const antifraudScore = Math.max(
    0,
    100 - criticalAnomalies * 30 - highAnomalies * 15 - mediumAnomalies * 5
  );

  // Build detailed requirements based on current tier
  const buildTier0Requirements = (): TierRequirement[] => [
    {
      id: "account_created",
      label: "Account Created",
      description: "Register and create your business profile",
      completed: true,
      weight: 10,
    },
    {
      id: "first_document",
      label: "Upload First Document",
      description: "Add at least one invoice, receipt, or bank statement",
      completed: processedDocs.length >= 1,
      progress: Math.min(100, processedDocs.length * 100),
      weight: 30,
    },
    {
      id: "three_months_data",
      label: "3 Months of Records",
      description: "Provide at least 3 months of financial history",
      completed: monthsWithData.size >= 3,
      progress: Math.min(100, (monthsWithData.size / 3) * 100),
      weight: 30,
    },
    {
      id: "evidence_score_40",
      label: "Evidence Quality 40%+",
      description: "Achieve minimum evidence quality score",
      completed: evidenceScore >= 40,
      progress: Math.min(100, (evidenceScore / 40) * 100),
      weight: 30,
    },
  ];

  const buildTier1Requirements = (): TierRequirement[] => [
    {
      id: "invoices_uploaded",
      label: "Sales Invoices",
      description: "Upload at least 5 sales invoices",
      completed: invoices.length >= 5,
      progress: Math.min(100, (invoices.length / 5) * 100),
      weight: 25,
    },
    {
      id: "bank_statement",
      label: "Bank Statement",
      description: "Upload at least one bank statement for corroboration",
      completed: bankStatements.length >= 1,
      progress: bankStatements.length >= 1 ? 100 : 0,
      weight: 35,
    },
    {
      id: "reconciliation_pass",
      label: "Reconciliation Check",
      description: "Cross-source data must match with 70%+ accuracy",
      completed: (reconciliation?.reconciliationScore || 0) >= 70,
      progress: reconciliation?.reconciliationScore || 0,
      weight: 25,
    },
    {
      id: "evidence_score_60",
      label: "Evidence Quality 60%+",
      description: "Achieve higher evidence quality score",
      completed: evidenceScore >= 60,
      progress: Math.min(100, (evidenceScore / 60) * 100),
      weight: 15,
    },
  ];

  const buildTier2Requirements = (): TierRequirement[] => [
    {
      id: "clean_antifraud",
      label: "Clean Anti-Fraud Check",
      description: "Pass all anti-fraud checks with no critical issues",
      completed: criticalAnomalies === 0 && highAnomalies === 0,
      progress: antifraudScore,
      weight: 30,
    },
    {
      id: "verification_request",
      label: "Request Verification",
      description: "Issue a credential to a lender or partner for verification",
      completed: activeProofs.length >= 1,
      progress: activeProofs.length >= 1 ? 100 : 0,
      weight: 25,
    },
    {
      id: "human_verification",
      label: "Human Attestation",
      description: "A verifier must review and attest to your data",
      completed: blockchainVerified.length >= 1,
      progress: blockchainVerified.length >= 1 ? 100 : 0,
      weight: 25,
    },
    {
      id: "blockchain_anchor",
      label: "Blockchain Anchoring",
      description:
        "Verification anchored on blockchain for tamper-proof record",
      completed: blockchainVerified.length >= 1,
      progress: blockchainVerified.length >= 1 ? 100 : 0,
      weight: 20,
    },
  ];

  // Calculate tier progress
  const calculateProgress = (requirements: TierRequirement[]): number => {
    const totalWeight = requirements.reduce((sum, r) => sum + r.weight, 0);
    const completedWeight = requirements.reduce((sum, r) => {
      const progress = r.completed ? 100 : r.progress || 0;
      return sum + (progress / 100) * r.weight;
    }, 0);
    return Math.round((completedWeight / totalWeight) * 100);
  };

  // Determine verification strength
  const getVerificationStrength = (
    tier: TrustTier,
    antifraud: number
  ): "weak" | "moderate" | "strong" | "verified" => {
    if (tier === 3) return "verified";
    if (tier === 2 && antifraud >= 80) return "strong";
    if (tier >= 1 && antifraud >= 60) return "moderate";
    return "weak";
  };

  // Tier 3: Verified
  if (blockchainVerified.length >= 1) {
    const reqs = buildTier2Requirements();
    return {
      tier: 3,
      label: "Verified",
      description: "Human/lender attestation with blockchain verification",
      requirements: [
        "Document-backed evidence",
        "Bank statement corroboration",
        "Verifier attestation",
        "Blockchain anchoring",
      ],
      detailedRequirements: reqs.map((r) => ({ ...r, completed: true })),
      tierProgress: 100,
      antifraudScore,
      verificationStrength: "verified",
    };
  }

  // Tier 2: Bank-Supported
  if (
    bankStatements.length >= 1 &&
    evidenceScore >= 60 &&
    (reconciliation?.reconciliationScore || 0) >= 70
  ) {
    const reqs = buildTier2Requirements();
    return {
      tier: 2,
      label: "Bank-Supported",
      description: "Evidence corroborated by bank statements",
      requirements: [
        "Bank statements uploaded",
        "Document consistency verified",
        "Cross-source reconciliation",
      ],
      nextTierRequirements: [
        "Request verification from a lender or partner",
        "Complete blockchain attestation",
      ],
      detailedRequirements: reqs,
      tierProgress: calculateProgress(reqs),
      antifraudScore,
      verificationStrength: getVerificationStrength(2, antifraudScore),
    };
  }

  // Tier 1: Document-Backed
  if (processedDocs.length >= 1 && evidenceScore >= 40) {
    const reqs = buildTier1Requirements();
    return {
      tier: 1,
      label: "Document-Backed",
      description: "Evidence supported by invoices, receipts, and documents",
      requirements: [
        "Invoices or receipts uploaded",
        "Basic consistency verified",
      ],
      nextTierRequirements: [
        "Upload bank statements for corroboration",
        "Achieve 60%+ evidence quality score",
      ],
      detailedRequirements: reqs,
      tierProgress: calculateProgress(reqs),
      antifraudScore,
      verificationStrength: getVerificationStrength(1, antifraudScore),
    };
  }

  // Tier 0: Self-Declared
  const tier0Reqs = buildTier0Requirements();
  return {
    tier: 0,
    label: "Self-Declared",
    description: "Manual entries only, lowest credibility weight",
    requirements: ["Account created", "Basic data entered"],
    nextTierRequirements: [
      "Upload supporting documents (invoices, receipts)",
      "Add at least 3 months of financial records",
    ],
    detailedRequirements: tier0Reqs,
    tierProgress: calculateProgress(tier0Reqs),
    antifraudScore,
    verificationStrength: "weak",
  };
}

// Confidence Level
function calculateConfidence(
  anomalies: AnomalyAlert[],
  evidenceQuality: EvidenceQualityScore,
  reconciliation: { reconciliationScore: number }
): "high" | "medium" | "low" {
  const totalPenalty = anomalies.reduce(
    (sum, a) => sum + a.confidenceReduction,
    0
  );
  const evidenceIssues = evidenceQuality.flags.filter(
    (f) => f.type === "critical" || f.type === "warning"
  ).length;

  const confidenceScore =
    100 -
    totalPenalty -
    evidenceIssues * 10 -
    (100 - reconciliation.reconciliationScore) * 0.2;

  if (confidenceScore >= 70) return "high";
  if (confidenceScore >= 40) return "medium";
  return "low";
}

// Improvement Actions
function generateImprovementActions(
  evidence: EvidenceQualityScore,
  stability: StabilityGrowthScore,
  compliance: ComplianceReadinessScore,
  trustTier: TrustTierInfo,
  anomalies: AnomalyAlert[]
): ImprovementAction[] {
  const actions: ImprovementAction[] = [];

  // Evidence improvements
  if (evidence.documentBackedRatio < 50) {
    actions.push({
      priority: "immediate",
      category: "evidence",
      title: "Add Supporting Documents",
      description:
        "Upload invoices, receipts, or bank statements to back your entries",
      potentialGain: 20,
      effort: "low",
    });
  }

  if (evidence.continuityScore < 60) {
    actions.push({
      priority: "short_term",
      category: "evidence",
      title: "Build Financial History",
      description:
        "Upload documents from the past 6 months for better continuity",
      potentialGain: 15,
      effort: "medium",
    });
  }

  // Stability improvements
  if (stability.cashflowHealth < 50) {
    actions.push({
      priority: "immediate",
      category: "stability",
      title: "Improve Cashflow Position",
      description: "Focus on collecting receivables and managing expenses",
      potentialGain: 15,
      effort: "high",
    });
  }

  // Compliance improvements
  compliance.flags.forEach((flag) => {
    if (flag.type === "critical" || flag.type === "warning") {
      actions.push({
        priority: flag.type === "critical" ? "immediate" : "short_term",
        category: "compliance",
        title: flag.message,
        description: flag.recommendation,
        potentialGain: 10,
        effort: "medium",
      });
    }
  });

  // Trust tier advancement
  if (trustTier.nextTierRequirements && trustTier.tier < 3) {
    trustTier.nextTierRequirements.forEach((req) => {
      actions.push({
        priority: "medium_term",
        category: "verification",
        title: `Advance to Tier ${trustTier.tier + 1}`,
        description: req,
        potentialGain: 25,
        effort: trustTier.tier === 2 ? "high" : "medium",
      });
    });
  }

  // Sort by priority and potential gain
  const priorityOrder = { immediate: 0, short_term: 1, medium_term: 2 };
  return actions.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.potentialGain - a.potentialGain;
  });
}
