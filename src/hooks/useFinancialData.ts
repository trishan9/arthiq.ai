import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface Transaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  type?: 'income' | 'expense';
  amount?: number;
  category?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  amount: number;
}

export interface ExtractedDocument {
  type: string;
  // Bank statement fields
  bank_name?: string;
  opening_balance?: number;
  closing_balance?: number;
  transactions?: Transaction[];
  total_debits?: number;
  total_credits?: number;
  // Invoice/Receipt fields
  invoice_number?: string;
  receipt_number?: string;
  invoice_date?: string;
  date?: string;
  vendor_name?: string;
  merchant_name?: string;
  items?: InvoiceItem[];
  subtotal?: number;
  vat_amount?: number;
  total_amount?: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface CategoryData {
  name: string;
  amount: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  totalDocuments: number;
  pendingDocuments: number;
  revenueChange: number;
  expenseChange: number;
  monthlyData: MonthlyData[];
  expenseCategories: CategoryData[];
  revenueCategories: CategoryData[];
  recentTransactions: Transaction[];
  financialHealthScore: number;
  vatCollected: number;
  averageTransactionValue: number;
  documentCount: number;
}

const DEFAULT_METRICS: FinancialMetrics = {
  totalRevenue: 0,
  totalExpenses: 0,
  totalDocuments: 0,
  pendingDocuments: 0,
  revenueChange: 0,
  expenseChange: 0,
  monthlyData: [],
  expenseCategories: [],
  revenueCategories: [],
  recentTransactions: [],
  financialHealthScore: 0,
  vatCollected: 0,
  averageTransactionValue: 0,
  documentCount: 0,
};

export function useFinancialData() {
  const [documents, setDocuments] = useState<Array<{ extracted_data: Json | null; status: string; document_type: string; created_at: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("extracted_data, status, document_type, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("documents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents" },
        () => {
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const metrics = useMemo<FinancialMetrics>(() => {
    if (documents.length === 0) return DEFAULT_METRICS;

    let totalRevenue = 0;
    let totalExpenses = 0;
    let vatCollected = 0;
    const allTransactions: Transaction[] = [];
    const expenseByCategory: Record<string, number> = {};
    const revenueBySource: Record<string, number> = {};
    const monthlyAggregates: Record<string, { income: number; expenses: number }> = {};

    const processedDocs = documents.filter(d => d.status === "processed" && d.extracted_data);
    const pendingDocs = documents.filter(d => d.status === "pending" || d.status === "processing");

    processedDocs.forEach(doc => {
      if (!doc.extracted_data || typeof doc.extracted_data !== "object" || Array.isArray(doc.extracted_data)) return;
      
      const data = doc.extracted_data as Record<string, Json>;
      const docType = (data.type as string) || doc.document_type;

      if (docType === "bank_statement") {
        const rawTransactions = Array.isArray(data.transactions) ? data.transactions : [];
        const transactions = rawTransactions.map(tx => {
          const txObj = tx as Record<string, unknown>;
          return {
            date: (txObj.date as string) || "",
            description: (txObj.description as string) || "",
            debit: (txObj.debit as number) || null,
            credit: (txObj.credit as number) || null,
            balance: (txObj.balance as number) || 0,
          };
        });
        
        transactions.forEach(tx => {
          allTransactions.push(tx);
          
          if (tx.credit && tx.credit > 0) {
            totalRevenue += tx.credit;
            
            // Categorize by description keywords
            const desc = tx.description?.toLowerCase() || "";
            if (desc.includes("sale") || desc.includes("payment received")) {
              revenueBySource["Sales"] = (revenueBySource["Sales"] || 0) + tx.credit;
            } else if (desc.includes("service")) {
              revenueBySource["Services"] = (revenueBySource["Services"] || 0) + tx.credit;
            } else {
              revenueBySource["Other Income"] = (revenueBySource["Other Income"] || 0) + tx.credit;
            }
          }
          
          if (tx.debit && tx.debit > 0) {
            totalExpenses += tx.debit;
            
            // Categorize expenses
            const desc = tx.description?.toLowerCase() || "";
            if (desc.includes("rent") || desc.includes("lease")) {
              expenseByCategory["Rent"] = (expenseByCategory["Rent"] || 0) + tx.debit;
            } else if (desc.includes("salary") || desc.includes("wage")) {
              expenseByCategory["Salaries"] = (expenseByCategory["Salaries"] || 0) + tx.debit;
            } else if (desc.includes("utility") || desc.includes("electric") || desc.includes("water")) {
              expenseByCategory["Utilities"] = (expenseByCategory["Utilities"] || 0) + tx.debit;
            } else if (desc.includes("supply") || desc.includes("material")) {
              expenseByCategory["Supplies"] = (expenseByCategory["Supplies"] || 0) + tx.debit;
            } else {
              expenseByCategory["Other"] = (expenseByCategory["Other"] || 0) + tx.debit;
            }
          }

          // Aggregate by month
          if (tx.date) {
            const monthKey = tx.date.substring(0, 7); // YYYY-MM
            if (!monthlyAggregates[monthKey]) {
              monthlyAggregates[monthKey] = { income: 0, expenses: 0 };
            }
            if (tx.credit) monthlyAggregates[monthKey].income += tx.credit;
            if (tx.debit) monthlyAggregates[monthKey].expenses += tx.debit;
          }
        });
      }

      if (docType === "invoice") {
        const amount = (data.total_amount as number) || 0;
        totalRevenue += amount;
        
        // Use category if available from manual entry
        const category = (data.category as string) || "Invoices";
        revenueBySource[category] = (revenueBySource[category] || 0) + amount;
        vatCollected += (data.vat_amount as number) || 0;

        const dateStr = (data.invoice_date as string) || doc.created_at;
        if (dateStr) {
          const monthKey = dateStr.substring(0, 7);
          if (!monthlyAggregates[monthKey]) {
            monthlyAggregates[monthKey] = { income: 0, expenses: 0 };
          }
          monthlyAggregates[monthKey].income += amount;
        }
      }

      if (docType === "receipt") {
        const amount = (data.total_amount as number) || 0;
        totalExpenses += amount;
        
        // Use category if available from manual entry, otherwise use merchant
        const category = (data.category as string) || (data.merchant_name as string) || "Purchases";
        expenseByCategory[category] = (expenseByCategory[category] || 0) + amount;
        vatCollected += (data.vat_amount as number) || 0;

        const dateStr = (data.date as string) || doc.created_at;
        if (dateStr) {
          const monthKey = dateStr.substring(0, 7);
          if (!monthlyAggregates[monthKey]) {
            monthlyAggregates[monthKey] = { income: 0, expenses: 0 };
          }
          monthlyAggregates[monthKey].expenses += amount;
        }
      }

      // Process Profit & Loss statements
      if (docType === "profit_loss") {
        const plRevenue = (data.total_revenue as number) || 0;
        const plExpenses = (data.total_expenses as number) || 0;
        totalRevenue += plRevenue;
        totalExpenses += plExpenses;

        // Process individual revenue items
        const revenueItems = Array.isArray(data.revenue_items) ? data.revenue_items : [];
        revenueItems.forEach((item: unknown) => {
          const itemObj = item as Record<string, unknown>;
          const desc = (itemObj.description as string) || "Other Income";
          const amt = (itemObj.amount as number) || 0;
          revenueBySource[desc] = (revenueBySource[desc] || 0) + amt;
        });

        // Process individual expense items
        const expenseItemsList = Array.isArray(data.expense_items) ? data.expense_items : [];
        expenseItemsList.forEach((item: unknown) => {
          const itemObj = item as Record<string, unknown>;
          const desc = (itemObj.description as string) || "Other Expenses";
          const amt = (itemObj.amount as number) || 0;
          expenseByCategory[desc] = (expenseByCategory[desc] || 0) + amt;
        });

        const dateStr = (data.date as string) || doc.created_at;
        if (dateStr) {
          const monthKey = dateStr.substring(0, 7);
          if (!monthlyAggregates[monthKey]) {
            monthlyAggregates[monthKey] = { income: 0, expenses: 0 };
          }
          monthlyAggregates[monthKey].income += plRevenue;
          monthlyAggregates[monthKey].expenses += plExpenses;
        }
      }

      // Process Balance Sheets (for financial health metrics)
      if (docType === "balance_sheet") {
        const assets = (data.total_assets as number) || 0;
        const liabilities = (data.total_liabilities as number) || 0;
        const equity = (data.total_equity as number) || 0;

        // Add to revenue/expense for overview purposes
        if (assets > 0) {
          revenueBySource["Assets (Balance Sheet)"] = (revenueBySource["Assets (Balance Sheet)"] || 0) + assets;
        }
      }
    });

    // Convert monthly aggregates to array
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = Object.entries(monthlyAggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8) // Last 8 months
      .map(([key, data]) => {
        const [year, month] = key.split("-");
        return {
          month: monthNames[parseInt(month) - 1] || key,
          income: data.income,
          expenses: data.expenses,
          profit: data.income - data.expenses,
        };
      });

    // Convert categories to arrays
    const expenseCategories = Object.entries(expenseByCategory)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    const revenueCategories = Object.entries(revenueBySource)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    // Calculate financial health score (0-100)
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    const documentCoverage = documents.length > 0 ? (processedDocs.length / documents.length) * 100 : 0;
    const healthScore = Math.min(100, Math.max(0, Math.round((profitMargin * 0.6) + (documentCoverage * 0.4))));

    // Calculate average transaction value
    const avgTransaction = allTransactions.length > 0
      ? allTransactions.reduce((sum, tx) => sum + (tx.credit || tx.debit || 0), 0) / allTransactions.length
      : 0;

    return {
      totalRevenue,
      totalExpenses,
      totalDocuments: documents.length,
      pendingDocuments: pendingDocs.length,
      revenueChange: 12.5, // Would calculate from historical data
      expenseChange: 8.2,
      monthlyData,
      expenseCategories,
      revenueCategories,
      recentTransactions: allTransactions.slice(0, 10),
      financialHealthScore: healthScore,
      vatCollected,
      averageTransactionValue: avgTransaction,
      documentCount: documents.length,
    };
  }, [documents]);

  return {
    metrics,
    isLoading,
    hasData: documents.length > 0,
  };
}
