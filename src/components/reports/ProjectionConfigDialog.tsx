import { useState } from "react";
import { TrendingUp, Calculator, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProjectionConfig } from "@/lib/projectionReportGenerator";

interface ProjectionConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (config: ProjectionConfig) => Promise<void>;
  isGenerating?: boolean;
}

export function ProjectionConfigDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating = false,
}: ProjectionConfigDialogProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [projectionMonths, setProjectionMonths] = useState<"6" | "12" | "24">(
    "12"
  );
  const [growthScenario, setGrowthScenario] = useState<
    "conservative" | "moderate" | "optimistic"
  >("moderate");
  const [includeLoan, setIncludeLoan] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [interestRate, setInterestRate] = useState("12");
  const [loanTermMonths, setLoanTermMonths] = useState("24");

  const handleSubmit = async () => {
    const config: ProjectionConfig = {
      businessName: businessName || "My Business",
      businessType: businessType || undefined,
      panNumber: panNumber || undefined,
      projectionMonths: parseInt(projectionMonths),
      growthScenario,
      ...(includeLoan && loanAmount
        ? {
            loanAmount: parseFloat(loanAmount),
            loanPurpose: loanPurpose || "Business Expansion",
            interestRate: parseFloat(interestRate) || 12,
            loanTermMonths: parseInt(loanTermMonths) || 24,
          }
        : {}),
    };

    await onGenerate(config);
    onOpenChange(false);
  };

  const scenarioDescriptions = {
    conservative: "5% annual revenue growth, 4% expense growth",
    moderate: "10% annual revenue growth, 7% expense growth",
    optimistic: "18% annual revenue growth, 10% expense growth",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Generate Projection Report
          </DialogTitle>
          <DialogDescription>
            Create a financial projection report based on your historical data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Business Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Business Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Your Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  placeholder="e.g., Retail, Manufacturing"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                placeholder="e.g., 123456789"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Projection Settings */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Projection Settings</h4>

            <div className="space-y-1.5">
              <Label>Projection Period</Label>
              <Select
                value={projectionMonths}
                onValueChange={(v) =>
                  setProjectionMonths(v as "6" | "12" | "24")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months (1 Year)</SelectItem>
                  <SelectItem value="24">24 Months (2 Years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Growth Scenario</Label>
              <RadioGroup
                value={growthScenario}
                onValueChange={(v) =>
                  setGrowthScenario(v as typeof growthScenario)
                }
                className="space-y-2"
              >
                {(["conservative", "moderate", "optimistic"] as const).map(
                  (scenario) => (
                    <div
                      key={scenario}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem
                        value={scenario}
                        id={scenario}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={scenario}
                          className="font-medium cursor-pointer capitalize"
                        >
                          {scenario}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {scenarioDescriptions[scenario]}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </RadioGroup>
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Include Loan Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Calculate DSCR and loan impact
                </p>
              </div>
              <Switch checked={includeLoan} onCheckedChange={setIncludeLoan} />
            </div>

            {includeLoan && (
              <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="loanAmount">Loan Amount (NPR)</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      placeholder="e.g., 500000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loanPurpose">Purpose</Label>
                    <Input
                      id="loanPurpose"
                      placeholder="e.g., Working Capital"
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      placeholder="12"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loanTerm">Loan Term (Months)</Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      placeholder="24"
                      value={loanTermMonths}
                      onChange={(e) => setLoanTermMonths(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
