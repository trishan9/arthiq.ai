import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, DollarSign, Calendar, Building, Receipt, TrendingUp, TrendingDown, Scale, Wallet } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface ExtractedDataViewProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  data: Json | null;
}

export function ExtractedDataView({ isOpen, onClose, fileName, data }: ExtractedDataViewProps) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const dataObj = data as Record<string, Json>;
  const documentType = (dataObj.type as string) || "unknown";

  const renderBankStatement = () => {
    const transactions = (Array.isArray(dataObj.transactions) ? dataObj.transactions : []) as Array<Record<string, Json>>;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard icon={Building} label="Bank" value={dataObj.bank_name as string} />
          <InfoCard icon={FileText} label="Account" value={dataObj.account_number as string} />
          <InfoCard icon={Calendar} label="Period" value={dataObj.statement_period as string} />
          <InfoCard icon={DollarSign} label="Currency" value={dataObj.currency as string} />
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Opening Balance</p>
            <p className="text-xl font-semibold text-foreground">
              {formatCurrency(dataObj.opening_balance as number)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Closing Balance</p>
            <p className="text-xl font-semibold text-foreground">
              {formatCurrency(dataObj.closing_balance as number)}
            </p>
          </div>
        </div>

        {transactions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-foreground mb-3">Transactions ({transactions.length})</h4>
              <div className="space-y-2 max-h-64 overflow-auto">
                {transactions.slice(0, 10).map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description as string}</p>
                      <p className="text-xs text-muted-foreground">{tx.date as string}</p>
                    </div>
                    <div className="text-right">
                      {tx.credit && <span className="text-success">+{formatCurrency(tx.credit as number)}</span>}
                      {tx.debit && <span className="text-destructive">-{formatCurrency(tx.debit as number)}</span>}
                    </div>
                  </div>
                ))}
                {transactions.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    ...and {transactions.length - 10} more transactions
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderInvoice = () => {
    const items = (Array.isArray(dataObj.items) ? dataObj.items : []) as Array<Record<string, Json>>;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard icon={FileText} label="Invoice #" value={dataObj.invoice_number as string} />
          <InfoCard icon={Calendar} label="Date" value={dataObj.invoice_date as string} />
          <InfoCard icon={Building} label="Vendor" value={dataObj.vendor_name as string} />
          <InfoCard icon={FileText} label="PAN" value={dataObj.vendor_pan as string} />
        </div>

        {dataObj.category && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{dataObj.category as string}</Badge>
            {dataObj.is_vatable && <Badge className="bg-accent/20 text-accent">VAT Applicable</Badge>}
          </div>
        )}

        {items.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-foreground mb-3">Items</h4>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.description as string}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity as number}</p>
                    </div>
                    <p className="font-medium text-foreground">{formatCurrency(item.amount as number)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />
        
        <div className="bg-primary/5 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatCurrency(dataObj.subtotal as number)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT</span>
            <span className="text-foreground">{formatCurrency(dataObj.vat_amount as number)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
            <span className="text-foreground">Total</span>
            <span className="text-accent">{formatCurrency(dataObj.total_amount as number)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderReceipt = () => {
    const items = (Array.isArray(dataObj.items) ? dataObj.items : []) as Array<Record<string, Json>>;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard icon={Receipt} label="Receipt #" value={dataObj.receipt_number as string} />
          <InfoCard icon={Calendar} label="Date" value={dataObj.date as string} />
          <InfoCard icon={Building} label="Merchant" value={dataObj.merchant_name as string} />
          <InfoCard icon={FileText} label="Payment" value={dataObj.payment_method as string} />
        </div>

        {dataObj.category && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{dataObj.category as string}</Badge>
            {dataObj.is_vatable && <Badge className="bg-accent/20 text-accent">VAT Applicable</Badge>}
            {dataObj.is_taxable && <Badge className="bg-warning/20 text-warning">Tax Deductible</Badge>}
          </div>
        )}

        {items.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-foreground mb-3">Items</h4>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-foreground">{item.description as string}</span>
                    <span className="font-medium text-foreground">{formatCurrency(item.amount as number)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />
        
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex justify-between font-semibold text-lg">
            <span className="text-foreground">Total</span>
            <span className="text-accent">{formatCurrency(dataObj.total_amount as number)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderProfitLoss = () => {
    const revenueItems = (Array.isArray(dataObj.revenue_items) ? dataObj.revenue_items : []) as Array<Record<string, Json>>;
    const expenseItems = (Array.isArray(dataObj.expense_items) ? dataObj.expense_items : []) as Array<Record<string, Json>>;
    const totalRevenue = (dataObj.total_revenue as number) || 0;
    const totalExpenses = (dataObj.total_expenses as number) || 0;
    const netProfit = (dataObj.net_profit as number) || (totalRevenue - totalExpenses);
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard icon={Building} label="Company" value={dataObj.company_name as string} />
          <InfoCard icon={Calendar} label="Fiscal Year" value={dataObj.fiscal_year as string} />
        </div>

        <Separator />

        {/* Revenue Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-success" />
            <h4 className="font-medium text-foreground">Revenue</h4>
          </div>
          <div className="space-y-2">
            {revenueItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                <span className="text-sm text-foreground">{item.description as string}</span>
                <span className="font-medium text-success">{formatCurrency(item.amount as number)}</span>
              </div>
            ))}
            <div className="flex justify-between p-3 bg-success/10 rounded-lg font-semibold">
              <span>Total Revenue</span>
              <span className="text-success">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Expense Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-destructive" />
            <h4 className="font-medium text-foreground">Expenses</h4>
          </div>
          <div className="space-y-2">
            {expenseItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                <span className="text-sm text-foreground">{item.description as string}</span>
                <span className="font-medium text-destructive">{formatCurrency(item.amount as number)}</span>
              </div>
            ))}
            <div className="flex justify-between p-3 bg-destructive/10 rounded-lg font-semibold">
              <span>Total Expenses</span>
              <span className="text-destructive">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Net Profit */}
        <div className={`p-4 rounded-lg ${netProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Net Profit / Loss</span>
            <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(netProfit)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    const assetItems = (Array.isArray(dataObj.asset_items) ? dataObj.asset_items : []) as Array<Record<string, Json>>;
    const liabilityItems = (Array.isArray(dataObj.liability_items) ? dataObj.liability_items : []) as Array<Record<string, Json>>;
    const equityItems = (Array.isArray(dataObj.equity_items) ? dataObj.equity_items : []) as Array<Record<string, Json>>;
    const totalAssets = (dataObj.total_assets as number) || 0;
    const totalLiabilities = (dataObj.total_liabilities as number) || 0;
    const totalEquity = (dataObj.total_equity as number) || 0;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard icon={Building} label="Company" value={dataObj.company_name as string} />
          <InfoCard icon={Calendar} label="Fiscal Year" value={dataObj.fiscal_year as string} />
        </div>

        <Separator />

        {/* Assets Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-info" />
            <h4 className="font-medium text-foreground">Assets</h4>
          </div>
          <div className="space-y-2">
            {assetItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-info/5 rounded-lg">
                <div>
                  <span className="text-sm text-foreground">{item.description as string}</span>
                  {item.category && (
                    <Badge variant="outline" className="ml-2 text-xs">{item.category as string}</Badge>
                  )}
                </div>
                <span className="font-medium text-info">{formatCurrency(item.amount as number)}</span>
              </div>
            ))}
            <div className="flex justify-between p-3 bg-info/10 rounded-lg font-semibold">
              <span>Total Assets</span>
              <span className="text-info">{formatCurrency(totalAssets)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Liabilities Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-warning" />
            <h4 className="font-medium text-foreground">Liabilities</h4>
          </div>
          <div className="space-y-2">
            {liabilityItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                <div>
                  <span className="text-sm text-foreground">{item.description as string}</span>
                  {item.category && (
                    <Badge variant="outline" className="ml-2 text-xs">{item.category as string}</Badge>
                  )}
                </div>
                <span className="font-medium text-warning">{formatCurrency(item.amount as number)}</span>
              </div>
            ))}
            <div className="flex justify-between p-3 bg-warning/10 rounded-lg font-semibold">
              <span>Total Liabilities</span>
              <span className="text-warning">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Equity Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-accent" />
            <h4 className="font-medium text-foreground">Owner's Equity</h4>
          </div>
          <div className="space-y-2">
            {equityItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                <span className="text-sm text-foreground">{item.description as string}</span>
                <span className="font-medium text-accent">{formatCurrency(item.amount as number)}</span>
              </div>
            ))}
            <div className="flex justify-between p-3 bg-accent/10 rounded-lg font-semibold">
              <span>Total Equity</span>
              <span className="text-accent">{formatCurrency(totalEquity)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Balance Check */}
        <div className={`p-4 rounded-lg ${totalAssets === (totalLiabilities + totalEquity) ? 'bg-success/10' : 'bg-destructive/10'}`}>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Balance Check (A = L + E)</span>
            <span className={`text-lg font-bold ${totalAssets === (totalLiabilities + totalEquity) ? 'text-success' : 'text-destructive'}`}>
              {totalAssets === (totalLiabilities + totalEquity) ? '✓ Balanced' : '✗ Imbalanced'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderRawData = () => (
    <pre className="text-xs bg-muted/50 rounded-lg p-4 overflow-auto max-h-96">
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            {fileName}
          </DialogTitle>
          <Badge variant="outline" className="w-fit">
            {documentType.replace("_", " ").toUpperCase()}
          </Badge>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="pr-4">
            {documentType === "bank_statement" && renderBankStatement()}
            {documentType === "invoice" && renderInvoice()}
            {documentType === "receipt" && renderReceipt()}
            {documentType === "profit_loss" && renderProfitLoss()}
            {documentType === "balance_sheet" && renderBalanceSheet()}
            {!["bank_statement", "invoice", "receipt", "profit_loss", "balance_sheet"].includes(documentType) && renderRawData()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || "N/A"}</p>
      </div>
    </div>
  );
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
  }).format(amount);
}
