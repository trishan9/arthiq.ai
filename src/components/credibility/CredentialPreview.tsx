import {
  Shield,
  CheckCircle,
  Building2,
  Calendar,
  Hash,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CredentialPreviewProps {
  proofName: string;
  sharedWith?: string;
  claims: { id: string; name: string; claim: string }[];
  expiresAt: Date;
  credibilityScore: number;
  txHash?: string;
  verificationUrl?: string;
  onViewBlockchain?: () => void;
  onCopyLink?: () => void;
}

export function CredentialPreview({
  proofName,
  sharedWith,
  claims,
  expiresAt,
  credibilityScore,
  txHash,
  verificationUrl,
  onViewBlockchain,
  onCopyLink,
}: CredentialPreviewProps) {
  return (
    <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-hero p-6 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70 uppercase tracking-wider">
                Verified Financial Credential
              </p>
              <h3 className="text-xl font-bold">
                {proofName || "Untitled Credential"}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
              <QrCode className="w-8 h-8 text-primary-foreground/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Credibility Score Badge */}
        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div>
            <p className="text-sm text-muted-foreground">Credibility Score</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(credibilityScore)}/100
            </p>
          </div>
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              credibilityScore >= 80
                ? "bg-success/10 text-success"
                : credibilityScore >= 60
                ? "bg-accent/10 text-accent"
                : "bg-warning/10 text-warning"
            }`}
          >
            <CheckCircle className="w-8 h-8" />
          </div>
        </div>

        {/* Verified Claims */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Verified Claims
          </p>
          <div className="space-y-2">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center gap-2 p-3 bg-success/5 rounded-lg border border-success/20"
              >
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-sm text-foreground">{claim.claim}</span>
              </div>
            ))}
            {claims.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No claims selected
              </p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {sharedWith && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>
                Shared with:{" "}
                <span className="text-foreground">{sharedWith}</span>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Valid until:{" "}
              <span className="text-foreground">
                {format(expiresAt, "MMM d, yyyy")}
              </span>
            </span>
          </div>
          {txHash && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Hash className="w-4 h-4" />
              <span className="font-mono text-xs truncate">{txHash}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {(txHash || verificationUrl) && (
          <div className="flex gap-3 pt-4 border-t border-border">
            {onViewBlockchain && txHash && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewBlockchain}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Blockchain
              </Button>
            )}
            {onCopyLink && verificationUrl && (
              <Button
                variant="accent"
                size="sm"
                onClick={onCopyLink}
                className="flex-1"
              >
                Share Verification Link
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          This credential is cryptographically secured and independently
          verifiable on the Ethereum blockchain.
        </p>
      </div>
    </div>
  );
}
