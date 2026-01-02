import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface ManualEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type EntryType = "income" | "expense" | "profit_loss" | "balance_sheet";

interface LineItem {
  description: string;
  amount: number;
}

export function ManualEntryDialog({ isOpen, onClose, onSuccess }: ManualEntryDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>("income");
  
  // Common fields
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [isVatable, setIsVatable] = useState(false);
  const [vatRate, setVatRate] = useState("13");
  const [partyName, setPartyName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  
  // P&L fields
  const [fiscalYear, setFiscalYear] = useState("2080/81");
  const [revenueItems, setRevenueItems] = useState<LineItem[]>([{ description: "", amount: 0 }]);
  const [expenseItems, setExpenseItems] = useState<LineItem[]>([{ description: "", amount: 0 }]);
  
  // Balance Sheet fields
  const [assetItems, setAssetItems] = useState<LineItem[]>([{ description: "", amount: 0 }]);
  const [liabilityItems, setLiabilityItems] = useState<LineItem[]>([{ description: "", amount: 0 }]);
  const [equityItems, setEquityItems] = useState<LineItem[]>([{ description: "", amount: 0 }]);

  const incomeCategories = ["Sales Revenue", "Service Revenue", "Interest Income", "Commission", "Rental Income", "Other Income"];
  const expenseCategories = ["Rent", "Salaries", "Utilities", "Office Supplies", "Travel", "Marketing", "Professional Fees", "Insurance", "Depreciation", "Other"];

  const addLineItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>) => {
    setter(prev => [...prev, { description: "", amount: 0 }]);
  };

  const removeLineItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>,
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const calculateVAT = (baseAmount: number): number => {
    if (!isVatable) return 0;
    return baseAmount * (parseFloat(vatRate) / 100);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let extractedData: Record<string, unknown>;
      let documentType: string;
      let fileName: string;

      if (entryType === "income") {
        const baseAmount = parseFloat(amount) || 0;
        const vatAmount = calculateVAT(baseAmount);
        extractedData = {
          type: "invoice",
          invoice_number: `INV-${Date.now().toString().slice(-6)}`,
          invoice_date: date,
          vendor_name: partyName || "Manual Entry",
          vendor_pan: panNumber || null,
          items: [{ description, quantity: 1, unit_price: baseAmount, amount: baseAmount }],
          subtotal: baseAmount,
          vat_amount: vatAmount,
          total_amount: baseAmount + vatAmount,
          currency: "NPR",
          category: category,
          is_vatable: isVatable,
          entry_source: "manual"
        };
        documentType = "invoice";
        fileName = `Income - ${description || category} - ${date}.manual`;
      } else if (entryType === "expense") {
        const baseAmount = parseFloat(amount) || 0;
        const vatAmount = calculateVAT(baseAmount);
        extractedData = {
          type: "receipt",
          receipt_number: `RCP-${Date.now().toString().slice(-6)}`,
          date: date,
          merchant_name: partyName || "Manual Entry",
          merchant_pan: panNumber || null,
          items: [{ description, quantity: 1, amount: baseAmount }],
          subtotal: baseAmount,
          vat_amount: vatAmount,
          total_amount: baseAmount + vatAmount,
          currency: "NPR",
          category: category,
          is_vatable: isVatable,
          is_taxable: true,
          entry_source: "manual"
        };
        documentType = "receipt";
        fileName = `Expense - ${description || category} - ${date}.manual`;
      } else if (entryType === "profit_loss") {
        const totalRevenue = revenueItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalExpenses = expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        extractedData = {
          type: "profit_loss",
          fiscal_year: fiscalYear,
          date: date,
          revenue_items: revenueItems.filter(item => item.description && item.amount),
          expense_items: expenseItems.filter(item => item.description && item.amount),
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          gross_profit: totalRevenue - totalExpenses,
          net_profit: totalRevenue - totalExpenses,
          currency: "NPR",
          entry_source: "manual"
        };
        documentType = "profit_loss";
        fileName = `Profit & Loss Statement - ${fiscalYear}.manual`;
      } else {
        const totalAssets = assetItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalLiabilities = liabilityItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalEquity = equityItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        extractedData = {
          type: "balance_sheet",
          fiscal_year: fiscalYear,
          date: date,
          asset_items: assetItems.filter(item => item.description && item.amount),
          liability_items: liabilityItems.filter(item => item.description && item.amount),
          equity_items: equityItems.filter(item => item.description && item.amount),
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          total_equity: totalEquity,
          currency: "NPR",
          entry_source: "manual"
        };
        documentType = "balance_sheet";
        fileName = `Balance Sheet - ${fiscalYear}.manual`;
      }

      const { error } = await supabase.from("documents").insert([{
        file_name: fileName,
        file_type: "manual_entry",
        file_size: 0,
        file_path: `manual/${Date.now()}`,
        document_type: documentType,
        status: "processed",
        extracted_data: extractedData as unknown as Json,
      }]);

      if (error) throw error;

      toast({
        title: "Entry Added",
        description: "Your financial data has been recorded successfully.",
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error adding manual entry:", error);
      toast({
        title: "Error",
        description: "Failed to add entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setIsVatable(false);
    setPartyName("");
    setPanNumber("");
    setRevenueItems([{ description: "", amount: 0 }]);
    setExpenseItems([{ description: "", amount: 0 }]);
    setAssetItems([{ description: "", amount: 0 }]);
    setLiabilityItems([{ description: "", amount: 0 }]);
    setEquityItems([{ description: "", amount: 0 }]);
  };

  const renderLineItems = (
    label: string,
    items: LineItem[],
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => addLineItem(setter)}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder="Description"
            value={item.description}
            onChange={(e) => updateLineItem(setter, index, "description", e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Amount"
            value={item.amount || ""}
            onChange={(e) => updateLineItem(setter, index, "amount", parseFloat(e.target.value) || 0)}
            className="w-32"
          />
          {items.length > 1 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(setter, index)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      ))}
      <p className="text-sm text-muted-foreground text-right">
        Total: NPR {items.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Financial Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Entry Type Selection */}
          <div className="space-y-2">
            <Label>Entry Type</Label>
            <Select value={entryType} onValueChange={(v) => setEntryType(v as EntryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income / Sales Invoice</SelectItem>
                <SelectItem value="expense">Expense / Purchase Receipt</SelectItem>
                <SelectItem value="profit_loss">Profit & Loss Statement</SelectItem>
                <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {/* Income/Expense Form */}
          {(entryType === "income" || entryType === "expense") && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{entryType === "income" ? "Customer/Party Name" : "Vendor/Supplier Name"}</Label>
                  <Input
                    placeholder="Enter name"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number (Optional)</Label>
                  <Input
                    placeholder="9 digit PAN"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    maxLength={9}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(entryType === "income" ? incomeCategories : expenseCategories).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (NPR)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="vatable"
                      checked={isVatable}
                      onCheckedChange={(checked) => setIsVatable(checked === true)}
                    />
                    <Label htmlFor="vatable">VAT Applicable (13%)</Label>
                  </div>
                </div>
              </div>

              {isVatable && parseFloat(amount) > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>NPR {parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (13%)</span>
                    <span>NPR {calculateVAT(parseFloat(amount)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>NPR {(parseFloat(amount) + calculateVAT(parseFloat(amount))).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* P&L Statement Form */}
          {entryType === "profit_loss" && (
            <>
              <div className="space-y-2">
                <Label>Fiscal Year</Label>
                <Select value={fiscalYear} onValueChange={setFiscalYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2081/82">2081/82 (Current)</SelectItem>
                    <SelectItem value="2080/81">2080/81</SelectItem>
                    <SelectItem value="2079/80">2079/80</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderLineItems("Revenue Items", revenueItems, setRevenueItems)}
              {renderLineItems("Expense Items", expenseItems, setExpenseItems)}

              <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="text-success">NPR {revenueItems.reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Expenses</span>
                  <span className="text-destructive">NPR {expenseItems.reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Net Profit/Loss</span>
                  <span className={revenueItems.reduce((s, i) => s + (i.amount || 0), 0) - expenseItems.reduce((s, i) => s + (i.amount || 0), 0) >= 0 ? "text-success" : "text-destructive"}>
                    NPR {(revenueItems.reduce((s, i) => s + (i.amount || 0), 0) - expenseItems.reduce((s, i) => s + (i.amount || 0), 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Balance Sheet Form */}
          {entryType === "balance_sheet" && (
            <>
              <div className="space-y-2">
                <Label>As of Fiscal Year</Label>
                <Select value={fiscalYear} onValueChange={setFiscalYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2081/82">2081/82 (Current)</SelectItem>
                    <SelectItem value="2080/81">2080/81</SelectItem>
                    <SelectItem value="2079/80">2079/80</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderLineItems("Assets", assetItems, setAssetItems)}
              {renderLineItems("Liabilities", liabilityItems, setLiabilityItems)}
              {renderLineItems("Owner's Equity", equityItems, setEquityItems)}

              <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Assets</span>
                  <span>NPR {assetItems.reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Liabilities</span>
                  <span>NPR {liabilityItems.reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Equity</span>
                  <span>NPR {equityItems.reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Balance Check (A = L + E)</span>
                  <span className={
                    assetItems.reduce((s, i) => s + (i.amount || 0), 0) === 
                    liabilityItems.reduce((s, i) => s + (i.amount || 0), 0) + equityItems.reduce((s, i) => s + (i.amount || 0), 0)
                      ? "text-success" : "text-destructive"
                  }>
                    {assetItems.reduce((s, i) => s + (i.amount || 0), 0) === 
                    liabilityItems.reduce((s, i) => s + (i.amount || 0), 0) + equityItems.reduce((s, i) => s + (i.amount || 0), 0)
                      ? "✓ Balanced" : "✗ Imbalanced"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}