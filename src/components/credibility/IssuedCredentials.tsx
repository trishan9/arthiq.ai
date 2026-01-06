import { useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Clock,
  Building2,
  FileText,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { VerificationProof } from "@/hooks/useVerificationProofs";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface IssuedCredentialsProps {
  credentials: VerificationProof[];
  onCopyLink: (url: string) => void;
  onViewBlockchain: (txHash: string) => void;
  onRevoke: (id: string) => void;
}

export function IssuedCredentials({
  credentials,
  onCopyLink,
  onViewBlockchain,
  onRevoke,
}: IssuedCredentialsProps) {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] =
    useState<VerificationProof | null>(null);

  const activeCredentials = credentials.filter((c) => c.status === "active");
  const expiredCredentials = credentials.filter((c) => c.status !== "active");

  const getVerificationUrl = (credential: VerificationProof) => {
    return `${window.location.origin}/verify?hash=${credential.proof_hash}`;
  };

  const handleShowQR = (credential: VerificationProof) => {
    setSelectedCredential(credential);
    setQrDialogOpen(true);
  };

  if (credentials.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Credentials Issued
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Create your first verifiable credential to share with lenders,
          partners, or investors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Credentials */}
      {activeCredentials.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            Active Credentials ({activeCredentials.length})
          </h4>
          <div className="grid gap-4">
            {activeCredentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                onCopyLink={() => onCopyLink(getVerificationUrl(credential))}
                onViewBlockchain={onViewBlockchain}
                onRevoke={onRevoke}
                onShowQR={() => handleShowQR(credential)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expired/Revoked Credentials */}
      {expiredCredentials.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Expired/Revoked ({expiredCredentials.length})
          </h4>
          <div className="grid gap-4 opacity-60">
            {expiredCredentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                onCopyLink={() => onCopyLink(getVerificationUrl(credential))}
                onViewBlockchain={onViewBlockchain}
                onRevoke={onRevoke}
                onShowQR={() => handleShowQR(credential)}
              />
            ))}
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Verification QR Code
            </DialogTitle>
          </DialogHeader>
          {selectedCredential && (
            <div className="space-y-4">
              <div className="flex justify-center p-6 bg-white rounded-xl">
                <QRCodeSVG
                  value={getVerificationUrl(selectedCredential)}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-foreground">
                  {selectedCredential.proof_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Share this QR code with lenders or partners. They can scan it
                  to instantly verify your financial credentials.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    onCopyLink(getVerificationUrl(selectedCredential))
                  }
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  className="flex-1"
                  onClick={() =>
                    window.open(
                      getVerificationUrl(selectedCredential),
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Page
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CredentialCard({
  credential,
  onCopyLink,
  onViewBlockchain,
  onRevoke,
  onShowQR,
}: {
  credential: VerificationProof;
  onCopyLink: () => void;
  onViewBlockchain: (txHash: string) => void;
  onRevoke: (id: string) => void;
  onShowQR: () => void;
}) {
  const isActive = credential.status === "active";
  const daysUntilExpiry = Math.ceil(
    (new Date(credential.expires_at).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon =
    isActive && daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border p-5 transition-all",
        isActive ? "border-border hover:border-accent/50" : "border-border/50"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            isActive ? "bg-accent/10" : "bg-muted"
          )}
        >
          <Shield
            className={cn(
              "w-6 h-6",
              isActive ? "text-accent" : "text-muted-foreground"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-foreground">
                {credential.proof_name}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                {credential.shared_with && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {credential.shared_with}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isActive ? (
                    isExpiringSoon ? (
                      <span className="text-warning">
                        Expires in {daysUntilExpiry} days
                      </span>
                    ) : (
                      <>
                        Expires{" "}
                        {format(new Date(credential.expires_at), "MMM d, yyyy")}
                      </>
                    )
                  ) : credential.status === "revoked" ? (
                    "Revoked"
                  ) : (
                    "Expired"
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {credential.status === "active" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </span>
              ) : credential.status === "revoked" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                  <XCircle className="w-3 h-3" />
                  Revoked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  Expired
                </span>
              )}
            </div>
          </div>

          {/* Included Claims */}
          <div className="mt-3 flex flex-wrap gap-2">
            {credential.included_data.map((item) => (
              <span
                key={item.id}
                className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded"
              >
                {item.name}
              </span>
            ))}
          </div>

          {/* Actions */}
          {isActive && (
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onShowQR}>
                <QrCode className="w-3 h-3 mr-2" />
                QR Code
              </Button>
              <Button variant="outline" size="sm" onClick={onCopyLink}>
                <Copy className="w-3 h-3 mr-2" />
                Copy Link
              </Button>
              {credential.tx_hash && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewBlockchain(credential.tx_hash!)}
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Blockchain
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRevoke(credential.id)}
                className="text-destructive hover:text-destructive ml-auto"
              >
                <XCircle className="w-3 h-3 mr-2" />
                Revoke
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
