import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getFormattedKnowledgeBase,
  NEPAL_TAX_DATA,
  NEPAL_LABOR_LAW,
  getThresholdAlerts,
} from "../_shared/nepalKnowledge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DocumentData {
  type: string;
  total_amount?: number;
  vat_amount?: number;
  transactions?: Array<{
    date: string;
    description: string;
    debit: number | null;
    credit: number | null;
  }>;
  invoice_date?: string;
  date?: string;
  vendor_name?: string;
  merchant_name?: string;
  items?: Array<{ description: string; amount: number }>;
  period?: string;
  total_revenue?: number;
  total_expenses?: number;
  net_profit?: number;
  gross_profit?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_equity?: number;
  current_assets?: number;
  current_liabilities?: number;
}

interface AnalysisRequest {
  documents: Array<{
    id: string;
    file_name: string;
    document_type: string;
    extracted_data: DocumentData | null;
    status: string;
    created_at: string;
  }>;
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    vatCollected: number;
    financialHealthScore: number;
    monthlyData: Array<{ month: string; income: number; expenses: number }>;
    expenseCategories: Array<{ name: string; amount: number }>;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documents, metrics }: AnalysisRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(
      "Analyzing documents for regulation insights:",
      documents?.length || 0
    );

    // Get formatted Nepal regulations from knowledge base
    const nepalRegulations = getFormattedKnowledgeBase();

    // Build document summary for AI analysis
    let documentSummary = "";

    const processedDocs =
      documents?.filter((d) => d.status === "processed" && d.extracted_data) ||
      [];
    const pendingDocs =
      documents?.filter((d) => d.status !== "processed") || [];

    // Categorize documents
    const invoices = processedDocs.filter((d) => d.document_type === "invoice");
    const receipts = processedDocs.filter((d) => d.document_type === "receipt");
    const bankStatements = processedDocs.filter(
      (d) => d.document_type === "bank_statement"
    );
    const taxDocs = processedDocs.filter(
      (d) => d.document_type === "tax_document"
    );
    const pnlStatements = processedDocs.filter(
      (d) => d.document_type === "profit_loss"
    );
    const balanceSheets = processedDocs.filter(
      (d) => d.document_type === "balance_sheet"
    );

    documentSummary += `\n## Document Inventory\n`;
    documentSummary += `- Total Documents: ${documents?.length || 0}\n`;
    documentSummary += `- Processed: ${processedDocs.length}\n`;
    documentSummary += `- Pending: ${pendingDocs.length}\n`;
    documentSummary += `- Invoices: ${invoices.length}\n`;
    documentSummary += `- Receipts: ${receipts.length}\n`;
    documentSummary += `- Bank Statements: ${bankStatements.length}\n`;
    documentSummary += `- Tax Documents: ${taxDocs.length}\n`;
    documentSummary += `- P&L Statements: ${pnlStatements.length}\n`;
    documentSummary += `- Balance Sheets: ${balanceSheets.length}\n`;

    if (metrics) {
      documentSummary += `\n## Financial Summary\n`;
      documentSummary += `- Total Revenue: NPR ${
        metrics.totalRevenue?.toLocaleString() || 0
      }\n`;
      documentSummary += `- Total Expenses: NPR ${
        metrics.totalExpenses?.toLocaleString() || 0
      }\n`;
      documentSummary += `- Net Profit: NPR ${(
        (metrics.totalRevenue || 0) - (metrics.totalExpenses || 0)
      ).toLocaleString()}\n`;
      documentSummary += `- VAT Collected: NPR ${
        metrics.vatCollected?.toLocaleString() || 0
      }\n`;
      documentSummary += `- Financial Health Score: ${
        metrics.financialHealthScore || 0
      }/100\n`;

      // Add threshold analysis
      const thresholdAlerts = getThresholdAlerts({
        totalRevenue: metrics.totalRevenue,
      });
      if (thresholdAlerts.length > 0) {
        documentSummary += `\n### Threshold Status\n`;
        thresholdAlerts.forEach((alert) => {
          documentSummary += `- **${
            alert.threshold
          }**: ${alert.status.toUpperCase()} - ${alert.implication}\n`;
        });
      }

      if (metrics.expenseCategories?.length > 0) {
        documentSummary += `\n### Expense Categories\n`;
        metrics.expenseCategories.forEach((cat) => {
          documentSummary += `- ${
            cat.name
          }: NPR ${cat.amount.toLocaleString()}\n`;
        });
      }
    }

    // Sample transaction and P&L data
    let transactionSummary = "";
    processedDocs.forEach((doc) => {
      const data = doc.extracted_data;
      if (!data) return;

      if (data.type === "bank_statement" && data.transactions) {
        const txSample = data.transactions.slice(0, 5);
        transactionSummary += `\n### Bank Statement Sample (${doc.file_name})\n`;
        txSample.forEach((tx) => {
          transactionSummary += `- ${tx.date}: ${tx.description} | Debit: ${
            tx.debit || 0
          } | Credit: ${tx.credit || 0}\n`;
        });
      }

      if (
        (data.type === "invoice" || data.type === "receipt") &&
        data.total_amount
      ) {
        transactionSummary += `\n### ${
          data.type === "invoice" ? "Invoice" : "Receipt"
        } (${doc.file_name})\n`;
        transactionSummary += `- Amount: NPR ${data.total_amount}\n`;
        transactionSummary += `- VAT: NPR ${data.vat_amount || 0}\n`;
        transactionSummary += `- Vendor: ${
          data.vendor_name || data.merchant_name || "Unknown"
        }\n`;
      }

      if (data.type === "profit_loss") {
        transactionSummary += `\n### Profit & Loss Statement (${doc.file_name})\n`;
        transactionSummary += `- Period: ${data.period || "Not specified"}\n`;
        transactionSummary += `- Total Revenue: NPR ${
          data.total_revenue?.toLocaleString() || "N/A"
        }\n`;
        transactionSummary += `- Total Expenses: NPR ${
          data.total_expenses?.toLocaleString() || "N/A"
        }\n`;
        transactionSummary += `- Gross Profit: NPR ${
          data.gross_profit?.toLocaleString() || "N/A"
        }\n`;
        transactionSummary += `- Net Profit: NPR ${
          data.net_profit?.toLocaleString() || "N/A"
        }\n`;
      }

      if (data.type === "balance_sheet") {
        transactionSummary += `\n### Balance Sheet (${doc.file_name})\n`;
        transactionSummary += `- Period: ${data.period || "Not specified"}\n`;
        transactionSummary += `- Total Assets: NPR ${
          data.total_assets?.toLocaleString() || "N/A"
        }\n`;
        transactionSummary += `- Total Liabilities: NPR ${
          data.total_liabilities?.toLocaleString() || "N/A"
        }\n`;
        transactionSummary += `- Total Equity: NPR ${
          data.total_equity?.toLocaleString() || "N/A"
        }\n`;
        transactionSummary += `- Current Assets: NPR ${
          data.current_assets?.toLocaleString() || "N/A"
        }\n`;
        transactionSummary += `- Current Liabilities: NPR ${
          data.current_liabilities?.toLocaleString() || "N/A"
        }\n`;
      }
    });

    // Include specific regulation numbers for reference
    const regulationContext = `
## Current Regulation Numbers (FY ${NEPAL_TAX_DATA.metadata.fiscal_year})
- VAT Registration Threshold: NPR ${NEPAL_TAX_DATA.thresholds.vat_registration.toLocaleString()}
- VAT Rate: ${NEPAL_TAX_DATA.vat.standard_rate * 100}%
- SSF Employer Contribution: ${NEPAL_TAX_DATA.ssf.employer_contribution * 100}%
- SSF Employee Contribution: ${NEPAL_TAX_DATA.ssf.employee_contribution * 100}%
- SSF Required for: ${NEPAL_TAX_DATA.ssf.minimum_employees_required}+ employees
- Minimum Wage: NPR ${NEPAL_LABOR_LAW.compensation.total_minimum.toLocaleString()}/month
- Corporate Tax: ${NEPAL_TAX_DATA.income_tax.corporate.general * 100}%
- TDS on Services (VAT): ${NEPAL_TAX_DATA.tds.service_vat_registered * 100}%
- TDS on Services (Non-VAT): ${NEPAL_TAX_DATA.tds.service_non_vat * 100}%
- TDS on Rent: ${NEPAL_TAX_DATA.tds.house_rent_company * 100}%
- Late Filing Penalty: ${NEPAL_TAX_DATA.vat.penalties.late_filing}
`;

    const analysisPrompt = `You are a Nepal SME tax and regulatory compliance analyst. Analyze the provided financial data and documents against Nepal's tax regulations.

${nepalRegulations}

${regulationContext}

${documentSummary}

${transactionSummary}

Provide a comprehensive JSON response with the following structure. Be specific and data-driven based on the actual documents provided:

{
  "summary": {
    "complianceScore": <0-100>,
    "riskLevel": "low" | "medium" | "high" | "critical",
    "overallAssessment": "<2 sentence summary>"
  },
  "taxObligations": [
    {
      "type": "VAT" | "Income Tax" | "TDS" | "SSF" | "Other",
      "status": "compliant" | "at_risk" | "non_compliant" | "needs_review",
      "description": "<what is the obligation>",
      "currentSituation": "<based on their data>",
      "requiredAction": "<specific action needed>",
      "deadline": "<if applicable>",
      "potentialPenalty": "<if non-compliant>"
    }
  ],
  "risks": [
    {
      "severity": "low" | "medium" | "high" | "critical",
      "category": "VAT" | "Income Tax" | "Documentation" | "TDS" | "SSF" | "Audit" | "Labor",
      "title": "<risk title>",
      "description": "<detailed description>",
      "financialImpact": "<estimated NPR amount if possible>",
      "recommendation": "<how to mitigate>"
    }
  ],
  "missingDocuments": [
    {
      "documentType": "<type of document>",
      "importance": "critical" | "important" | "recommended",
      "reason": "<why it's needed>",
      "regulatoryBasis": "<which regulation requires it>"
    }
  ],
  "recommendations": [
    {
      "priority": "immediate" | "short_term" | "medium_term",
      "category": "Tax Filing" | "Documentation" | "Process" | "Compliance" | "Labor",
      "title": "<action title>",
      "description": "<detailed recommendation>",
      "expectedBenefit": "<what they gain>",
      "effort": "low" | "medium" | "high"
    }
  ],
  "insights": [
    {
      "type": "pattern" | "anomaly" | "opportunity" | "warning",
      "title": "<insight title>",
      "description": "<what was found>",
      "dataPoint": "<specific data that led to this insight>",
      "suggestion": "<what to do about it>"
    }
  ],
  "thresholdAlerts": [
    {
      "threshold": "<which threshold>",
      "currentValue": "<their current value>",
      "thresholdValue": "<the limit>",
      "status": "below" | "approaching" | "exceeded",
      "implication": "<what this means for them>"
    }
  ]
}

Important rules:
1. If there's insufficient data, still provide the analysis but note the limitations in each section
2. Be specific to Nepal regulations with exact rates and deadlines from the knowledge base
3. Reference actual document types and amounts from the provided data
4. Calculate VAT obligations based on ${
      NEPAL_TAX_DATA.vat.standard_rate * 100
    }% rate if turnover suggests registration (NPR ${NEPAL_TAX_DATA.thresholds.vat_registration.toLocaleString()})
5. Flag if they appear to need VAT registration but don't have VAT documents
6. Check if their transaction patterns suggest TDS obligations
7. Assess documentation completeness against what's required for tax filing
8. Consider SSF compliance if they have employees
9. Check labor law compliance (minimum wage, working hours, leave provisions)

Respond ONLY with valid JSON, no markdown or explanation.`;

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
          messages: [{ role: "user", content: analysisPrompt }],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let insights;
    try {
      const jsonMatch =
        content.match(/```json\n?([\s\S]*?)\n?```/) ||
        content.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      insights = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      throw new Error("Failed to parse regulation insights");
    }

    console.log("Regulation insights generated successfully");

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Regulation insights error:", error);
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
