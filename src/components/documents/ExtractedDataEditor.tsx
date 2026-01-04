import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Plus, Trash2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Json } from "@/integrations/supabase/types";

interface ExtractedDataEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: Json | null;
  documentType: string;
  onSave: (data: Json) => Promise<void>;
  isSaving?: boolean;
  mode?: "edit" | "confirm";
  title?: string;
}

interface LineItem {
  description: string;
  quantity?: number;
  unit_price?: number;
  amount: number;
}

export function ExtractedDataEditor({
  isOpen,
  onClose,
  data,
  documentType,
  onSave,
  isSaving = false,
  mode = "edit",
  title,
}: ExtractedDataEditorProps) {
  const [editedData, setEditedData] = useState<any>(null);

  useEffect(() => {
    if (data && typeof data === "object") {
      setEditedData({ ...(data as object) });
    } else {
      setEditedData(null);
    }
  }, [data, isOpen]);

  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setEditedData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setEditedData((prev: any) => {
      const items = [...(prev.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleRevenueItemChange = (
    index: number,
    field: string,
    value: any
  ) => {
    setEditedData((prev: any) => {
      const items = [...(prev.revenue_items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, revenue_items: items };
    });
  };

  const handleExpenseItemChange = (
    index: number,
    field: string,
    value: any
  ) => {
    setEditedData((prev: any) => {
      const items = [...(prev.expense_items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, expense_items: items };
    });
  };

  const addItem = (listName: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      [listName]: [...(prev[listName] || []), { description: "", amount: 0 }],
    }));
  };

  const removeItem = (listName: string, index: number) => {
    setEditedData((prev: any) => ({
      ...prev,
      [listName]: prev[listName].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (editedData) {
      await onSave(editedData as Json);
    }
  };

  const renderInvoiceForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Invoice Number</Label>
          <Input
            value={editedData?.invoice_number || ""}
            onChange={(e) =>
              handleFieldChange("invoice_number", e.target.value)
            }
          />
        </div>
        <div>
          <Label>Invoice Date</Label>
          <Input
            type="date"
            value={editedData?.invoice_date || ""}
            onChange={(e) => handleFieldChange("invoice_date", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Vendor Name</Label>
          <Input
            value={editedData?.vendor_name || ""}
            onChange={(e) => handleFieldChange("vendor_name", e.target.value)}
          />
        </div>
        <div>
          <Label>Vendor PAN</Label>
          <Input
            value={editedData?.vendor_pan || ""}
            onChange={(e) => handleFieldChange("vendor_pan", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label>Customer Name</Label>
        <Input
          value={editedData?.customer_name || ""}
          onChange={(e) => handleFieldChange("customer_name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Line Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem("items")}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Item
          </Button>
        </div>
        {editedData?.items?.map((item: LineItem, index: number) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <Input
              placeholder="Description"
              className="col-span-5"
              value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
            />
            <Input
              type="number"
              placeholder="Qty"
              className="col-span-2"
              value={item.quantity || ""}
              onChange={(e) =>
                handleItemChange(index, "quantity", Number(e.target.value))
              }
            />
            <Input
              type="number"
              placeholder="Price"
              className="col-span-2"
              value={item.unit_price || ""}
              onChange={(e) =>
                handleItemChange(index, "unit_price", Number(e.target.value))
              }
            />
            <Input
              type="number"
              placeholder="Amount"
              className="col-span-2"
              value={item.amount}
              onChange={(e) =>
                handleItemChange(index, "amount", Number(e.target.value))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="col-span-1"
              onClick={() => removeItem("items", index)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Subtotal</Label>
          <Input
            type="number"
            value={editedData?.subtotal || ""}
            onChange={(e) =>
              handleFieldChange("subtotal", Number(e.target.value))
            }
          />
        </div>
        <div>
          <Label>VAT Amount</Label>
          <Input
            type="number"
            value={editedData?.vat_amount || ""}
            onChange={(e) =>
              handleFieldChange("vat_amount", Number(e.target.value))
            }
          />
        </div>
        <div>
          <Label>Total Amount</Label>
          <Input
            type="number"
            value={editedData?.total_amount || ""}
            onChange={(e) =>
              handleFieldChange("total_amount", Number(e.target.value))
            }
          />
        </div>
      </div>
    </div>
  );

  const renderReceiptForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Vendor Name</Label>
          <Input
            value={editedData?.vendor_name || ""}
            onChange={(e) => handleFieldChange("vendor_name", e.target.value)}
          />
        </div>
        <div>
          <Label>Receipt Date</Label>
          <Input
            type="date"
            value={editedData?.receipt_date || ""}
            onChange={(e) => handleFieldChange("receipt_date", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label>Vendor PAN</Label>
        <Input
          value={editedData?.vendor_pan || ""}
          onChange={(e) => handleFieldChange("vendor_pan", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem("items")}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Item
          </Button>
        </div>
        {editedData?.items?.map((item: LineItem, index: number) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <Input
              placeholder="Description"
              className="col-span-5"
              value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
            />
            <Input
              type="number"
              placeholder="Qty"
              className="col-span-2"
              value={item.quantity || ""}
              onChange={(e) =>
                handleItemChange(index, "quantity", Number(e.target.value))
              }
            />
            <Input
              type="number"
              placeholder="Price"
              className="col-span-2"
              value={item.unit_price || ""}
              onChange={(e) =>
                handleItemChange(index, "unit_price", Number(e.target.value))
              }
            />
            <Input
              type="number"
              placeholder="Amount"
              className="col-span-2"
              value={item.amount}
              onChange={(e) =>
                handleItemChange(index, "amount", Number(e.target.value))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="col-span-1"
              onClick={() => removeItem("items", index)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Subtotal</Label>
          <Input
            type="number"
            value={editedData?.subtotal || ""}
            onChange={(e) =>
              handleFieldChange("subtotal", Number(e.target.value))
            }
          />
        </div>
        <div>
          <Label>VAT Amount</Label>
          <Input
            type="number"
            value={editedData?.vat_amount || ""}
            onChange={(e) =>
              handleFieldChange("vat_amount", Number(e.target.value))
            }
          />
        </div>
        <div>
          <Label>Total Amount</Label>
          <Input
            type="number"
            value={editedData?.total_amount || ""}
            onChange={(e) =>
              handleFieldChange("total_amount", Number(e.target.value))
            }
          />
        </div>
      </div>
    </div>
  );

  const renderProfitLossForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Company Name</Label>
          <Input
            value={editedData?.company_name || ""}
            onChange={(e) => handleFieldChange("company_name", e.target.value)}
          />
        </div>
        <div>
          <Label>Fiscal Year</Label>
          <Input
            value={editedData?.fiscal_year || ""}
            onChange={(e) => handleFieldChange("fiscal_year", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label>Period</Label>
        <Input
          value={editedData?.period || ""}
          onChange={(e) => handleFieldChange("period", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-success">Revenue Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem("revenue_items")}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Revenue
          </Button>
        </div>
        {editedData?.revenue_items?.map(
          (item: { description: string; amount: number }, index: number) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <Input
                placeholder="Description"
                className="col-span-8"
                value={item.description}
                onChange={(e) =>
                  handleRevenueItemChange(index, "description", e.target.value)
                }
              />
              <Input
                type="number"
                placeholder="Amount"
                className="col-span-3"
                value={item.amount}
                onChange={(e) =>
                  handleRevenueItemChange(
                    index,
                    "amount",
                    Number(e.target.value)
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="col-span-1"
                onClick={() => removeItem("revenue_items", index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          )
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-destructive">Expense Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem("expense_items")}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Expense
          </Button>
        </div>
        {editedData?.expense_items?.map(
          (item: { description: string; amount: number }, index: number) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <Input
                placeholder="Description"
                className="col-span-8"
                value={item.description}
                onChange={(e) =>
                  handleExpenseItemChange(index, "description", e.target.value)
                }
              />
              <Input
                type="number"
                placeholder="Amount"
                className="col-span-3"
                value={item.amount}
                onChange={(e) =>
                  handleExpenseItemChange(
                    index,
                    "amount",
                    Number(e.target.value)
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="col-span-1"
                onClick={() => removeItem("expense_items", index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Total Revenue</Label>
          <Input
            type="number"
            value={editedData?.total_revenue || ""}
            onChange={(e) =>
              handleFieldChange("total_revenue", Number(e.target.value))
            }
          />
        </div>
        <div>
          <Label>Total Expenses</Label>
          <Input
            type="number"
            value={editedData?.total_expenses || ""}
            onChange={(e) =>
              handleFieldChange("total_expenses", Number(e.target.value))
            }
          />
        </div>
        <div>
          <Label>Net Profit</Label>
          <Input
            type="number"
            value={editedData?.net_profit || ""}
            onChange={(e) =>
              handleFieldChange("net_profit", Number(e.target.value))
            }
          />
        </div>
      </div>
    </div>
  );

  const renderBankStatementForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Bank Name</Label>
          <Input
            value={editedData?.bank_name || ""}
            onChange={(e) => handleFieldChange("bank_name", e.target.value)}
          />
        </div>
        <div>
          <Label>Account Number</Label>
          <Input
            value={editedData?.account_number || ""}
            onChange={(e) =>
              handleFieldChange("account_number", e.target.value)
            }
          />
        </div>
      </div>
      <div>
        <Label>Account Holder</Label>
        <Input
          value={editedData?.account_holder || ""}
          onChange={(e) => handleFieldChange("account_holder", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Period Start</Label>
          <Input
            type="date"
            value={editedData?.statement_period?.start_date || ""}
            onChange={(e) =>
              handleNestedChange(
                "statement_period",
                "start_date",
                e.target.value
              )
            }
          />
        </div>
        <div>
          <Label>Period End</Label>
          <Input
            type="date"
            value={editedData?.statement_period?.end_date || ""}
            onChange={(e) =>
              handleNestedChange("statement_period", "end_date", e.target.value)
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Opening Balance</Label>
          <Input
            type="number"
            value={editedData?.opening_balance || ""}
            onChange={(e) =>
              handleFieldChange("opening_balance", Number(e.target.value))
            }
          />
        </div>
        <div>
          <Label>Closing Balance</Label>
          <Input
            type="number"
            value={editedData?.closing_balance || ""}
            onChange={(e) =>
              handleFieldChange("closing_balance", Number(e.target.value))
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Total Credits</Label>
          <Input
            type="number"
            value={editedData?.total_credits || ""}
            onChange={(e) =>
              handleFieldChange("total_credits", Number(e.target.value))
            }
          />
        </div>
        <div>
          <Label>Total Debits</Label>
          <Input
            type="number"
            value={editedData?.total_debits || ""}
            onChange={(e) =>
              handleFieldChange("total_debits", Number(e.target.value))
            }
          />
        </div>
      </div>
    </div>
  );

  const renderGenericForm = () => (
    <div className="space-y-4">
      <div className="bg-muted/50 p-3 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
        <p className="text-sm text-muted-foreground">
          This document type doesn't have a specialized editor. You can edit the
          raw JSON below.
        </p>
      </div>
      <Textarea
        className="font-mono text-xs min-h-[300px]"
        value={JSON.stringify(editedData, null, 2)}
        onChange={(e) => {
          try {
            setEditedData(JSON.parse(e.target.value));
          } catch {
            // Invalid JSON, ignore
          }
        }}
      />
    </div>
  );

  const renderForm = () => {
    if (!editedData) return null;

    const type = editedData.type || documentType;

    switch (type) {
      case "invoice":
        return renderInvoiceForm();
      case "receipt":
        return renderReceiptForm();
      case "profit_loss":
        return renderProfitLossForm();
      case "bank_statement":
        return renderBankStatementForm();
      default:
        return renderGenericForm();
    }
  };

  const dialogTitle =
    title ||
    (mode === "confirm" ? "Review Extracted Data" : "Edit Extracted Data");

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {mode === "confirm" && (
            <p className="text-sm text-muted-foreground">
              Please review and correct any errors in the AI-extracted data
              before saving.
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">{renderForm()}</ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === "confirm" ? "Confirm & Save" : "Save Changes"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
