import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OfficialDocumentConfig } from "@/lib/officialDocumentGenerator";

interface BusinessInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (config: OfficialDocumentConfig) => void;
  documentType: string;
}

const BusinessInfoDialog = ({ open, onOpenChange, onSubmit, documentType }: BusinessInfoDialogProps) => {
  const [formData, setFormData] = useState<OfficialDocumentConfig>({
    businessName: "",
    panNumber: "",
    vatNumber: "",
    registrationNumber: "",
    address: "",
    fiscalYear: "",
    period: "Monthly",
    signatoryName: "",
    signatoryDesignation: "",
  });

  const handleSubmit = () => {
    onSubmit(formData);
    onOpenChange(false);
  };

  const handleChange = (field: keyof OfficialDocumentConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Business Information</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Enter your business details for the {documentType}. Fields can be edited in the PDF if left blank.
          </p>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                value={formData.panNumber}
                onChange={(e) => handleChange("panNumber", e.target.value)}
                placeholder="e.g., 123456789"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input
                id="vatNumber"
                value={formData.vatNumber}
                onChange={(e) => handleChange("vatNumber", e.target.value)}
                placeholder="e.g., 301234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration No.</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => handleChange("registrationNumber", e.target.value)}
                placeholder="Company Reg. No."
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="e.g., Kathmandu, Nepal"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiscalYear">Fiscal Year</Label>
              <Input
                id="fiscalYear"
                value={formData.fiscalYear}
                onChange={(e) => handleChange("fiscalYear", e.target.value)}
                placeholder="e.g., 2080/81"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => handleChange("period", e.target.value)}
                placeholder="e.g., Shrawan 2081"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signatoryName">Signatory Name</Label>
              <Input
                id="signatoryName"
                value={formData.signatoryName}
                onChange={(e) => handleChange("signatoryName", e.target.value)}
                placeholder="Authorized Person"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signatoryDesignation">Designation</Label>
              <Input
                id="signatoryDesignation"
                value={formData.signatoryDesignation}
                onChange={(e) => handleChange("signatoryDesignation", e.target.value)}
                placeholder="e.g., Managing Director"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.businessName}>
            Generate Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessInfoDialog;
