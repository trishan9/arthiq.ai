import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lender, EligibilityCriteria } from "@/hooks/use-market-place";
import { useToast } from "@/hooks/use-toast";

interface RequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lender: Lender | null;
  criteria: EligibilityCriteria | null;
  onSubmit: (data: {
    requestType: "loan" | "partnership";
    amount?: number;
    purpose?: string;
    message?: string;
  }) => Promise<void>;
}

export function RequestDialog({
  open,
  onOpenChange,
  lender,
  criteria,
  onSubmit,
}: RequestDialogProps) {
  const [requestType, setRequestType] = useState<"loan" | "partnership">(
    "loan"
  );
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        requestType,
        amount: amount ? parseFloat(amount) : undefined,
        purpose: purpose || undefined,
        message: message || undefined,
      });
      toast({
        title: "Request Submitted",
        description: `Your ${requestType} request has been sent to ${lender?.name}.`,
      });
      onOpenChange(false);
      // Reset form
      setAmount("");
      setPurpose("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lender) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Request</DialogTitle>
          <DialogDescription>
            Send a {requestType} request to {lender.name}
            {criteria && ` for "${criteria.name}"`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Type */}
          <div className="space-y-2">
            <Label>Request Type</Label>
            <RadioGroup
              value={requestType}
              onValueChange={(v) => setRequestType(v as "loan" | "partnership")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loan" id="loan" />
                <Label htmlFor="loan" className="font-normal cursor-pointer">
                  Loan
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partnership" id="partnership" />
                <Label
                  htmlFor="partnership"
                  className="font-normal cursor-pointer"
                >
                  Partnership
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount (for loans) */}
          {requestType === "loan" && (
            <div className="space-y-2">
              <Label htmlFor="amount">Requested Amount (NPR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          )}

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              placeholder={
                requestType === "loan"
                  ? "e.g., Working capital expansion"
                  : "e.g., Supply chain partnership"
              }
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell them more about your business and why you're a good fit..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Your current credibility score, trust tier, and financial summary
            will be shared with the lender.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
