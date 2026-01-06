import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  Search,
  AlertCircle,
  Building2,
  Camera,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface VerificationResult {
  verified: boolean;
  status?: string;
  proofName?: string;
  createdAt?: string;
  expiresAt?: string;
  txHash?: string;
  blockchainNetwork?: string;
  includedData?: { id: string; name: string }[];
  error?: string;
}

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  // Check if there's a hash in URL params on load
  useEffect(() => {
    const hash = searchParams.get("hash");
    if (hash) {
      setVerificationCode(hash);
      verifyCredential(hash);
    }
  }, [searchParams]);

  const verifyCredential = async (code: string) => {
    if (!code.trim()) return;

    setIsVerifying(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "blockchain-verify",
        {
          body: { action: "verify", hash: code.trim() },
        }
      );

      if (error) throw error;
      setResult(data);
    } catch (error) {
      console.error("Verification error:", error);
      setResult({
        verified: false,
        error:
          "Unable to verify credential. Please check the code and try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const startScanner = async () => {
    setShowScanner(true);

    // Dynamic import to avoid SSR issues
    const { Html5Qrcode } = await import("html5-qrcode");

    setTimeout(async () => {
      if (!scannerRef.current) return;

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Extract hash from URL or use as-is
            let hash = decodedText;
            try {
              const url = new URL(decodedText);
              hash = url.searchParams.get("hash") || decodedText;
            } catch {
              // Not a URL, use as-is
            }

            setVerificationCode(hash);
            stopScanner();
            verifyCredential(hash);
          },
          () => {} // Ignore scan failures
        );
      } catch (err) {
        console.error("Scanner error:", err);
        setShowScanner(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {
        console.log("Scanner stop error:", e);
      }
    }
    setShowScanner(false);
  };

  const viewOnBlockchain = (txHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">
                Credential Verification
              </h1>
              <p className="text-xs text-muted-foreground">
                Verify financial credentials on blockchain
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Verify a Credential
            </CardTitle>
            <CardDescription>
              Enter the verification code or scan the QR code from the
              credential you want to verify.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter verification code (e.g., 0x1a2b3c...)"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                onClick={() => verifyCredential(verificationCode)}
                disabled={isVerifying || !verificationCode.trim()}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {!showScanner ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={startScanner}
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan QR Code
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scanning...</span>
                  <Button variant="ghost" size="sm" onClick={stopScanner}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full rounded-lg overflow-hidden bg-muted"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        {result && (
          <Card
            className={cn(
              "border-2 transition-all",
              result.verified && result.status === "active"
                ? "border-success bg-success/5"
                : result.verified && result.status === "expired"
                ? "border-warning bg-warning/5"
                : result.verified && result.status === "revoked"
                ? "border-destructive bg-destructive/5"
                : "border-destructive bg-destructive/5"
            )}
          >
            <CardContent className="pt-6">
              {result.verified ? (
                <div className="space-y-6">
                  {/* Status Header */}
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                        result.status === "active"
                          ? "bg-success/20"
                          : result.status === "expired"
                          ? "bg-warning/20"
                          : "bg-destructive/20"
                      )}
                    >
                      {result.status === "active" ? (
                        <CheckCircle className="w-7 h-7 text-success" />
                      ) : result.status === "expired" ? (
                        <Clock className="w-7 h-7 text-warning" />
                      ) : (
                        <XCircle className="w-7 h-7 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {result.status === "active"
                          ? "Credential Verified"
                          : result.status === "expired"
                          ? "Credential Expired"
                          : "Credential Revoked"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {result.status === "active"
                          ? "This financial credential is valid and verified on blockchain."
                          : result.status === "expired"
                          ? "This credential has expired and is no longer valid."
                          : "This credential has been revoked by the issuer."}
                      </p>
                    </div>
                  </div>

                  {/* Credential Details */}
                  <div className="bg-background rounded-xl p-5 border border-border space-y-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Credential Name
                        </p>
                        <p className="font-semibold text-foreground">
                          {result.proofName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Issued On
                        </p>
                        <p className="font-medium text-foreground">
                          {result.createdAt &&
                            format(new Date(result.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {result.status === "active"
                            ? "Valid Until"
                            : "Expired On"}
                        </p>
                        <p className="font-medium text-foreground">
                          {result.expiresAt &&
                            format(new Date(result.expiresAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {/* Verified Claims */}
                    {result.includedData && result.includedData.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Verified Claims
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.includedData.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center gap-1.5 text-xs font-medium bg-accent/10 text-accent px-3 py-1.5 rounded-full"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Blockchain Proof */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">
                          Blockchain Proof
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {result.blockchainNetwork || "Sepolia Testnet"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Transaction Hash
                      </p>
                      <code className="block text-xs bg-background border border-border rounded-lg p-3 break-all font-mono text-foreground">
                        {result.txHash}
                      </code>
                    </div>
                    {result.txHash && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => viewOnBlockchain(result.txHash!)}
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        View on Etherscan
                      </Button>
                    )}
                  </div>

                  {/* Trust Note */}
                  <p className="text-xs text-center text-muted-foreground">
                    This credential was cryptographically signed and stored on
                    the Ethereum blockchain, providing tamper-proof verification
                    of the business's financial claims.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-7 h-7 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      Verification Failed
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {result.error ||
                        "This credential could not be verified. It may be invalid or does not exist."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>
            Credentials are issued by businesses through the LekhaPath platform
            and are independently verifiable on the Ethereum blockchain.
          </p>
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-4 h-4" />
            Powered by blockchain technology for maximum trust
          </p>
        </div>
      </main>
    </div>
  );
}
