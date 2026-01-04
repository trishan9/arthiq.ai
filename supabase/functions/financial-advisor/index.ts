import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getFormattedKnowledgeBase,
  NEPAL_TAX_DATA,
  NEPAL_LABOR_LAW,
  calculateTaxEstimates,
  calculateSSF,
} from "../_shared/nepalKnowledge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get formatted Nepal regulations from knowledge base
    const nepalRegulations = getFormattedKnowledgeBase();

    // Build context from financial data
    let businessContext = "";

    if (financialContext) {
      const { metrics, documents, recentTransactions } = financialContext;

      // Helper functions for safe number handling
      const safeNumber = (val: any) =>
        typeof val === "number" && !isNaN(val) ? val : 0;
      const formatNum = (val: any) => safeNumber(val).toLocaleString();

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

    const systemPrompt = `You are ArthiqAI, a precise financial advisor for Nepal. Your responses must be CONCISE, DATA-DRIVEN, and ACTIONABLE.

## RESPONSE RULES (MANDATORY)
1. BE BRIEF: Maximum 3-4 short paragraphs. Use bullet points for lists.
2. USE ACTUAL DATA: Always reference the user's specific numbers when available.
3. CITE REGULATIONS: Quote exact rates, thresholds, and deadlines from Nepal law.
4. NO FILLER: Skip generic advice. Every sentence must add value.
5. ANSWER DIRECTLY: Start with the direct answer, then provide context.

## Nepal Financial Regulations
${nepalRegulations}

${quickReference}

## User's Business Data
${
  businessContext ||
  "No documents uploaded. To get personalized advice, upload invoices, bank statements, or tax documents."
}

## Response Format
- Start with a DIRECT answer to the question
- Use NPR (Nepali Rupees) for all amounts
- Reference specific data from uploaded documents
- Cite exact tax rates, deadlines (in Bikram Sambat)
- End with ONE actionable next step

## What NOT to do
- No long introductions or pleasantries
- No repeating the question
- No generic advice that doesn't use their data
- No disclaimers in every response (one small note at end only if critical)

You are their trusted accountant. Be direct, precise, and helpful.`;

    console.log(
      "Sending request to Lovable AI with context length:",
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
