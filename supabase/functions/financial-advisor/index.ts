import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getFormattedKnowledgeBase,
  NEPAL_TAX_DATA,
  NEPAL_LABOR_LAW,
  calculateTaxEstimates,
} from "../_shared/nepalKnowledge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Trust tier definitions
const TRUST_TIERS = [
  {
    tier: 1,
    label: "Basic",
    minScore: 0,
    requirements: [
      "Upload at least 3 financial documents",
      "Complete business profile",
    ],
  },
  {
    tier: 2,
    label: "Verified",
    minScore: 40,
    requirements: [
      "6+ months of bank statements",
      "Valid VAT/PAN registration",
      "No major anomalies",
    ],
  },
  {
    tier: 3,
    label: "Trusted",
    minScore: 65,
    requirements: [
      "12+ months transaction history",
      "Clean VAT filing record",
      "Positive cash flow trend",
    ],
  },
  {
    tier: 4,
    label: "Premium",
    minScore: 85,
    requirements: [
      "2+ years financial history",
      "Blockchain-verified proofs",
      "Strong financial health score",
    ],
  },
];

// Calculate credibility gaps and recommendations
function getCredibilityAnalysis(credibilityData: any) {
  const score = credibilityData?.score || 0;
  const tier = credibilityData?.tier || 1;
  const documentCount = credibilityData?.documentCount || 0;
  const proofCount = credibilityData?.proofCount || 0;
  const anomalyCount = credibilityData?.anomalyCount || 0;
  const hasVatDocs = credibilityData?.hasVatDocs || false;
  const hasBankStatements = credibilityData?.hasBankStatements || false;
  const monthsOfData = credibilityData?.monthsOfData || 0;
  const financialHealth = credibilityData?.financialHealth || 0;

  const currentTier =
    TRUST_TIERS.find((t) => t.tier === tier) || TRUST_TIERS[0];
  const nextTier = TRUST_TIERS.find((t) => t.tier === tier + 1);

  const gaps: string[] = [];
  const recommendations: string[] = [];
  const strengths: string[] = [];

  // Analyze document gaps
  if (documentCount < 3) {
    gaps.push(
      `Only ${documentCount} documents uploaded (need 3+ for basic verification)`
    );
    recommendations.push(
      "Upload at least 3 financial documents (invoices, bank statements, VAT returns)"
    );
  } else {
    strengths.push(`${documentCount} documents uploaded`);
  }

  if (!hasBankStatements) {
    gaps.push("No bank statements uploaded");
    recommendations.push(
      "Upload 6+ months of bank statements for transaction verification"
    );
  } else if (monthsOfData < 6) {
    gaps.push(`Only ${monthsOfData} months of bank data (need 6+ for Tier 2)`);
    recommendations.push(
      `Upload ${6 - monthsOfData} more months of bank statements`
    );
  } else {
    strengths.push(`${monthsOfData} months of bank statement history`);
  }

  if (!hasVatDocs) {
    gaps.push("No VAT/PAN documentation");
    recommendations.push(
      "Upload VAT registration certificate or PAN card for compliance verification"
    );
  } else {
    strengths.push("VAT/PAN documentation verified");
  }

  // Analyze anomalies
  if (anomalyCount > 0) {
    gaps.push(`${anomalyCount} anomalies detected in financial records`);
    recommendations.push(
      "Review and resolve flagged anomalies in your documents"
    );
  } else {
    strengths.push("No anomalies in financial records");
  }

  // Analyze blockchain proofs
  if (proofCount === 0 && tier < 4) {
    gaps.push("No blockchain-verified proofs created");
    recommendations.push(
      "Create blockchain proofs of key financial metrics for Tier 4"
    );
  } else if (proofCount > 0) {
    strengths.push(`${proofCount} blockchain-verified proof(s)`);
  }

  // Financial health analysis
  if (financialHealth < 50) {
    gaps.push(`Financial health score is low (${financialHealth}/100)`);
    recommendations.push(
      "Improve cash flow and reduce expense-to-revenue ratio"
    );
  } else if (financialHealth >= 70) {
    strengths.push(`Strong financial health (${financialHealth}/100)`);
  }

  // Points needed for next tier
  const pointsToNextTier = nextTier ? nextTier.minScore - score : 0;

  return {
    currentScore: score,
    currentTier: tier,
    currentTierLabel: currentTier.label,
    nextTierLabel: nextTier?.label || "Maximum",
    pointsToNextTier,
    gaps,
    recommendations: recommendations.slice(0, 3), // Top 3 recommendations
    strengths,
    nextTierRequirements: nextTier?.requirements || [],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, financialContext, credibilityContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get formatted Nepal regulations from knowledge base
    const nepalRegulations = getFormattedKnowledgeBase();

    // Build context from financial data
    let businessContext = "";

    // Helper functions for safe number handling
    const safeNumber = (val: any) =>
      typeof val === "number" && !isNaN(val) ? val : 0;
    const formatNum = (val: any) => safeNumber(val).toLocaleString();

    // Add credibility context
    let credibilityAnalysis = "";
    if (credibilityContext) {
      const analysis = getCredibilityAnalysis(credibilityContext);

      credibilityAnalysis = `\n## SME Credibility Profile\n`;
      credibilityAnalysis += `- **Current Score**: ${analysis.currentScore}/100\n`;
      credibilityAnalysis += `- **Trust Tier**: ${analysis.currentTier} (${analysis.currentTierLabel})\n`;

      if (analysis.pointsToNextTier > 0) {
        credibilityAnalysis += `- **Next Tier**: ${analysis.nextTierLabel} (need ${analysis.pointsToNextTier} more points)\n`;
      } else {
        credibilityAnalysis += `- **Status**: Maximum trust tier achieved!\n`;
      }

      if (analysis.strengths.length > 0) {
        credibilityAnalysis += `\n### Credibility Strengths\n`;
        analysis.strengths.forEach((s) => {
          credibilityAnalysis += `✓ ${s}\n`;
        });
      }

      if (analysis.gaps.length > 0) {
        credibilityAnalysis += `\n### Credibility Gaps (Action Required)\n`;
        analysis.gaps.forEach((g) => {
          credibilityAnalysis += `⚠️ ${g}\n`;
        });
      }

      if (analysis.recommendations.length > 0) {
        credibilityAnalysis += `\n### Top Recommendations to Improve Score\n`;
        analysis.recommendations.forEach((r, i) => {
          credibilityAnalysis += `${i + 1}. ${r}\n`;
        });
      }

      if (analysis.nextTierRequirements.length > 0) {
        credibilityAnalysis += `\n### Requirements for ${analysis.nextTierLabel} Tier\n`;
        analysis.nextTierRequirements.forEach((r) => {
          credibilityAnalysis += `- ${r}\n`;
        });
      }
    }

    if (financialContext) {
      const { metrics, documents, recentTransactions } = financialContext;

      if (metrics) {
        businessContext += `\n## Current Business Financial Status\n`;
        businessContext += `- Total Revenue: NPR ${formatNum(
          metrics.totalRevenue
        )}\n`;
        businessContext += `- Total Expenses: NPR ${formatNum(
          metrics.totalExpenses
        )}\n`;
        businessContext += `- Net Profit: NPR ${formatNum(
          metrics.netProfit
        )}\n`;
        businessContext += `- Profit Margin: ${safeNumber(
          metrics.profitMargin
        ).toFixed(1)}%\n`;
        businessContext += `- Outstanding Receivables: NPR ${formatNum(
          metrics.outstandingReceivables
        )}\n`;
        businessContext += `- Processed Documents: ${safeNumber(
          metrics.documentCount
        )}\n`;
        businessContext += `- Financial Health Score: ${safeNumber(
          metrics.financialHealthScore
        )}/100\n`;

        // Add VAT status check
        const vatThreshold = NEPAL_TAX_DATA.thresholds.vat_registration;
        if (safeNumber(metrics.totalRevenue) >= vatThreshold) {
          businessContext += `\n⚠️ **VAT Status**: Revenue exceeds NPR ${vatThreshold.toLocaleString()} threshold. VAT registration is MANDATORY.\n`;
        } else if (safeNumber(metrics.totalRevenue) >= vatThreshold * 0.8) {
          businessContext += `\n⚠️ **VAT Warning**: Revenue at ${(
            (safeNumber(metrics.totalRevenue) / vatThreshold) *
            100
          ).toFixed(0)}% of VAT threshold.\n`;
        }

        // Add estimated tax calculation if profit available
        const profit = safeNumber(metrics.netProfit);
        if (profit > 0) {
          const taxEstimate = calculateTaxEstimates(profit);
          businessContext += `\n### Estimated Tax Liability\n`;
          businessContext += `- Estimated Annual Tax: NPR ${formatNum(
            taxEstimate.estimatedTax
          )}\n`;
          businessContext += `- Effective Tax Rate: ${taxEstimate.effectiveRate.toFixed(
            1
          )}%\n`;
        }

        if (
          metrics.monthlyData &&
          Array.isArray(metrics.monthlyData) &&
          metrics.monthlyData.length > 0
        ) {
          businessContext += `\n### Monthly Trends (Last ${metrics.monthlyData.length} months)\n`;
          metrics.monthlyData.forEach((m: any) => {
            if (m && m.month) {
              businessContext += `- ${m.month}: Revenue NPR ${formatNum(
                m.income
              )}, Expenses NPR ${formatNum(m.expenses)}\n`;
            }
          });
        }

        if (
          metrics.expenseCategories &&
          Array.isArray(metrics.expenseCategories) &&
          metrics.expenseCategories.length > 0
        ) {
          businessContext += `\n### Expense Breakdown\n`;
          metrics.expenseCategories.forEach((c: any) => {
            if (c && c.name) {
              businessContext += `- ${c.name}: NPR ${formatNum(
                c.value
              )} (${safeNumber(c.percentage).toFixed(1)}%)\n`;
            }
          });
        }
      }

      if (documents && Array.isArray(documents) && documents.length > 0) {
        businessContext += `\n## Uploaded Documents (${documents.length} total)\n`;
        documents.slice(0, 10).forEach((doc: any) => {
          if (doc && doc.file_name) {
            businessContext += `- ${doc.file_name} (${
              doc.document_type || "unknown"
            }, ${doc.status || "pending"})\n`;
          }
        });
      }

      if (
        recentTransactions &&
        Array.isArray(recentTransactions) &&
        recentTransactions.length > 0
      ) {
        businessContext += `\n## Recent Transactions\n`;
        recentTransactions.slice(0, 10).forEach((t: any) => {
          if (t && t.description) {
            businessContext += `- ${t.date || "N/A"}: ${
              t.description
            } - NPR ${formatNum(t.amount)} (${t.type || "unknown"})\n`;
          }
        });
      }
    }

    // Quick reference data for the AI
    const quickReference = `
## Quick Reference Numbers (FY ${NEPAL_TAX_DATA.metadata.fiscal_year})
- VAT Rate: ${NEPAL_TAX_DATA.vat.standard_rate * 100}%
- VAT Threshold: NPR ${NEPAL_TAX_DATA.thresholds.vat_registration.toLocaleString()}
- Corporate Tax: ${NEPAL_TAX_DATA.income_tax.corporate.general * 100}%
- TDS Services (VAT): ${NEPAL_TAX_DATA.tds.service_vat_registered * 100}%
- TDS Services (Non-VAT): ${NEPAL_TAX_DATA.tds.service_non_vat * 100}%
- TDS Rent: ${NEPAL_TAX_DATA.tds.house_rent_company * 100}%
- SSF Employer: ${NEPAL_TAX_DATA.ssf.employer_contribution * 100}%
- SSF Employee: ${NEPAL_TAX_DATA.ssf.employee_contribution * 100}%
- Minimum Wage: NPR ${NEPAL_LABOR_LAW.compensation.total_minimum.toLocaleString()}/month
- Festival Allowance: ${NEPAL_LABOR_LAW.compensation.festival_allowance}
- VAT Filing: ${NEPAL_TAX_DATA.vat.filing_deadline}
- Annual Return: ${NEPAL_TAX_DATA.fiscal_calendar.annual_return_due}
`;

    const systemPrompt = `You are a Credibility Advisor for SMEs in Nepal. Your role is to help businesses improve their financial credibility for loan applications and marketplace trust.

## RESPONSE RULES (MANDATORY)
1. BE BRIEF: Maximum 3-4 short paragraphs. Use bullet points for lists.
2. USE ACTUAL DATA: Always reference the user's specific credibility score, tier, and gaps.
3. PRIORITIZE CREDIBILITY: Focus on improving trust tier and loan-readiness.
4. CITE REGULATIONS: Quote exact rates, thresholds, and requirements from Nepal law.
5. ANSWER DIRECTLY: Start with the direct answer, then provide context.

## Nepal Financial Regulations
${nepalRegulations}

${quickReference}

${
  credibilityAnalysis ||
  "## Credibility Status\nNo credibility data available. Upload documents to get your credibility score."
}

## User's Business Data
${
  businessContext ||
  "No documents uploaded. Upload invoices, bank statements, and VAT returns to build your credibility profile."
}

## Response Focus Areas
When asked about credibility improvement:
1. Reference their CURRENT tier and score
2. Identify SPECIFIC gaps blocking tier advancement
3. Give ACTIONABLE steps with expected point gains
4. Explain how each action improves loan-readiness

When asked about loan readiness:
1. List documents lenders require in Nepal
2. Explain how credibility score affects loan approval
3. Highlight any compliance gaps (VAT, PAN, etc.)

## Trust Tier System Explanation
- Tier 1 (Basic): New businesses, minimal verification
- Tier 2 (Verified): 6+ months history, VAT compliant
- Tier 3 (Trusted): 12+ months, clean records, positive trends
- Tier 4 (Premium): 2+ years, blockchain proofs, excellent health

## Response Format
- Start with a DIRECT answer to the question
- Reference their current credibility score and tier
- Use NPR (Nepali Rupees) for all amounts
- End with ONE actionable next step with expected impact

You are their trusted credibility advisor. Be direct, precise, and action-oriented.`;

    console.log(
      "Sending request to Lovable AI with credibility context length:",
      credibilityAnalysis.length,
      "business context length:",
      businessContext.length
    );

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits depleted. Please add credits to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Financial advisor error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
