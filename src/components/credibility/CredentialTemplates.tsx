import {
  Building2,
  CreditCard,
  FileCheck,
  Handshake,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CredentialTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  claims: string[];
  useCase: string;
}

export const credentialTemplates: CredentialTemplate[] = [
  {
    id: "loan_application",
    name: "Loan Application",
    description: "For bank loans and credit facilities",
    icon: Building2,
    claims: [
      "revenue_threshold",
      "profit_positive",
      "vat_compliant",
      "financial_health",
    ],
    useCase:
      "Share with banks when applying for business loans or credit lines",
  },
  {
    id: "vendor_onboarding",
    name: "Vendor Qualification",
    description: "For B2B partnerships and vendor registration",
    icon: Handshake,
    claims: ["revenue_threshold", "business_active", "compliance_status"],
    useCase: "Prove financial stability to potential business partners",
  },
  {
    id: "credit_assessment",
    name: "Credit Assessment",
    description: "For trade credit and payment terms",
    icon: CreditCard,
    claims: ["profit_positive", "cash_flow_positive", "payment_history"],
    useCase: "Negotiate better payment terms with suppliers",
  },
  {
    id: "investor_pitch",
    name: "Investor Readiness",
    description: "For fundraising and investment",
    icon: TrendingUp,
    claims: [
      "revenue_growth",
      "profit_margin",
      "financial_health",
      "compliance_status",
    ],
    useCase: "Demonstrate traction to potential investors",
  },
  {
    id: "custom",
    name: "Custom Credential",
    description: "Select specific claims to verify",
    icon: FileCheck,
    claims: [],
    useCase: "Create a tailored credential for specific requirements",
  },
];

interface CredentialTemplatesProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

export function CredentialTemplates({
  selectedTemplate,
  onSelectTemplate,
}: CredentialTemplatesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {credentialTemplates.map((template) => {
        const Icon = template.icon;
        const isSelected = selectedTemplate === template.id;

        return (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all hover:shadow-md",
              isSelected
                ? "border-accent bg-accent/5 shadow-md"
                : "border-border bg-card hover:border-accent/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">
                  {template.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
