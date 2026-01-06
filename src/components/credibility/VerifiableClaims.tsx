import { CheckCircle, Eye, EyeOff, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface VerifiableClaim {
  id: string;
  name: string;
  description: string;
  claim: string; // What the lender sees
  privateData: string; // What stays private
  isVerified: boolean;
  value?: string | number | boolean;
}

interface VerifiableClaimsProps {
  claims: VerifiableClaim[];
  selectedClaims: string[];
  onToggleClaim: (claimId: string) => void;
  showPrivacyComparison?: boolean;
}

export function VerifiableClaims({
  claims,
  selectedClaims,
  onToggleClaim,
  showPrivacyComparison = true,
}: VerifiableClaimsProps) {
  return (
    <div className="space-y-3">
      {claims.map((claim) => {
        const isSelected = selectedClaims.includes(claim.id);

        return (
          <div
            key={claim.id}
            onClick={() => claim.isVerified && onToggleClaim(claim.id)}
            className={cn(
              "rounded-xl border transition-all",
              !claim.isVerified && "opacity-60 cursor-not-allowed",
              claim.isVerified && "cursor-pointer",
              isSelected
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/30"
            )}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    isSelected
                      ? "border-accent bg-accent"
                      : claim.isVerified
                      ? "border-muted-foreground"
                      : "border-muted"
                  )}
                >
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-accent-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">
                      {claim.name}
                    </h4>
                    {claim.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              Data Required
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Upload financial documents to verify this claim
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {claim.description}
                  </p>
                </div>
              </div>

              {showPrivacyComparison && isSelected && (
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-success mb-1">
                        What Lender Sees
                      </p>
                      <p className="text-sm text-foreground bg-success/5 px-2 py-1 rounded">
                        {claim.claim}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <EyeOff className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        What Stays Private
                      </p>
                      <p className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {claim.privateData}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {showPrivacyComparison && selectedClaims.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-info/5 rounded-lg border border-info/20">
          <Info className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
          <p className="text-sm text-info">
            <strong>Privacy Guarantee:</strong> Only the claims shown in green
            are shared. Your actual financial data (exact amounts, transaction
            details) never leaves Arthiq.
          </p>
        </div>
      )}
    </div>
  );
}
