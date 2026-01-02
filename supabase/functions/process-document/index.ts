import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, fileUrl, documentType } = await req.json();
    
    console.log("Processing document:", { documentId, documentType });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update document status to processing
    await supabase
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    // Build OCR prompt based on document type
    let systemPrompt = `You are a financial document OCR specialist for Nepal. Extract structured data from the document image.
    
IMPORTANT: First analyze the document to determine its type. Look for keywords like:
- "Profit and Loss", "Income Statement", "P&L" → profit_loss
- "Balance Sheet", "Statement of Financial Position" → balance_sheet
- "Bank Statement", "Account Statement" → bank_statement
- "Invoice", "Tax Invoice", "Bill" → invoice
- "Receipt", "Cash Memo", "Payment Receipt" → receipt

Always respond with valid JSON in the following format based on document type:

For Bank Statements:
{
  "type": "bank_statement",
  "bank_name": "string",
  "account_number": "string (masked)",
  "statement_period": "string",
  "opening_balance": number,
  "closing_balance": number,
  "currency": "NPR",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "debit": number or null,
      "credit": number or null,
      "balance": number
    }
  ],
  "total_debits": number,
  "total_credits": number
}

For Invoices:
{
  "type": "invoice",
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD or null",
  "vendor_name": "string",
  "vendor_pan": "string or null",
  "customer_name": "string or null",
  "items": [
    {
      "description": "string",
      "quantity": number,
      "unit_price": number,
      "amount": number
    }
  ],
  "subtotal": number,
  "vat_amount": number,
  "total_amount": number,
  "currency": "NPR"
}

For Receipts:
{
  "type": "receipt",
  "receipt_number": "string or null",
  "date": "YYYY-MM-DD",
  "merchant_name": "string",
  "merchant_pan": "string or null",
  "items": [
    {
      "description": "string",
      "quantity": number,
      "amount": number
    }
  ],
  "subtotal": number,
  "vat_amount": number,
  "total_amount": number,
  "payment_method": "string or null",
  "currency": "NPR"
}

For Profit & Loss Statements:
{
  "type": "profit_loss",
  "company_name": "string",
  "fiscal_year": "string (e.g., 2080/81)",
  "period": "string",
  "revenue_items": [
    { "description": "string", "amount": number }
  ],
  "expense_items": [
    { "description": "string", "amount": number }
  ],
  "total_revenue": number,
  "total_expenses": number,
  "gross_profit": number,
  "operating_expenses": number,
  "net_profit": number,
  "currency": "NPR"
}

For Balance Sheets:
{
  "type": "balance_sheet",
  "company_name": "string",
  "fiscal_year": "string (e.g., 2080/81)",
  "as_of_date": "YYYY-MM-DD",
  "asset_items": [
    { "description": "string", "amount": number, "category": "current" or "non_current" }
  ],
  "liability_items": [
    { "description": "string", "amount": number, "category": "current" or "non_current" }
  ],
  "equity_items": [
    { "description": "string", "amount": number }
  ],
  "total_assets": number,
  "total_liabilities": number,
  "total_equity": number,
  "currency": "NPR"
}

Extract all visible information accurately. Use null for fields that cannot be determined.
CRITICAL: Detect the document type correctly based on content, not just filename.`;

    const userPrompt = `Extract data from this ${documentType}. Return ONLY valid JSON, no additional text.`;

    // Call Lovable AI with vision capability
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: fileUrl } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        await supabase
          .from("documents")
          .update({ status: "error" })
          .eq("id", documentId);
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        await supabase
          .from("documents")
          .update({ status: "error" })
          .eq("id", documentId);
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response:", content);

    // Parse the extracted data
    let extractedData = null;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      extractedData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      extractedData = { raw_text: content, parse_error: true };
    }

    // Update document with extracted data
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        status: "processed",
        extracted_data: extractedData,
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Failed to update document:", updateError);
      throw updateError;
    }

    console.log("Document processed successfully:", documentId);

    return new Response(
      JSON.stringify({ success: true, extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
