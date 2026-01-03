import { useState } from "react";
import { Shield, CheckCircle, ExternalLink, Copy, Lock, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useVerificationProofs, VerificationItem } from "@/hooks/useVerificationProofs";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScoreBreakdown } from "@/components/credibility/ScoreBreakdown";

const verificationItemsBase: VerificationItem[] = [
  { id: "revenue_summary", name: "Revenue Summary", description: "Total revenue from all sources", available: true },
  { id: "expense_summary", name: "Expense Summary", description: "Total expenses by category", available: true },
  { id: "vat_compliance", name: "VAT Compliance", description: "VAT collection and status", available: true },
  { id: "profit_margin", name: "Profit Margin", description: "Net profit and margin percentage", available: true },
  { id: "transaction_history", name: "Transaction History", description: "Transaction count and averages", available: true },
  { id: "financial_health", name: "Financial Health Score", description: "Overall financial health metrics", available: true },
];

const Credibility = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>(["revenue_summary", "expense_summary"]);
  const [proofName, setProofName] = useState("");
  const [sharedWith, setSharedWith] = useState("");
  const [sharedWithEmail, setSharedWithEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { metrics, isLoading: metricsLoading, hasData } = useFinancialData();
  const { 
    proofs, 
    isLoading: proofsLoading, 
    isGenerating, 
    generateProof, 
    revokeProof,
    copyVerificationLink,
    viewOnBlockchain 
  } = useVerificationProofs();

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGenerateProof = async () => {
    if (!proofName.trim() || selectedItems.length === 0) return;

    const includedData = selectedItems.map(id => {
      const item = verificationItemsBase.find(v => v.id === id);
      return { id, name: item?.name || id };
    });

    // Calculate derived values
    const netProfit = metrics.totalRevenue - metrics.totalExpenses;
    const profitMargin = metrics.totalRevenue > 0 
      ? ((netProfit / metrics.totalRevenue) * 100) 
      : 0;

    const financialMetrics = {
      totalRevenue: metrics.totalRevenue,
      totalExpenses: metrics.totalExpenses,
      vatCollected: metrics.vatCollected,
      profitMargin,
      netProfit,
      revenueCategories: metrics.revenueCategories,
      expenseCategories: metrics.expenseCategories,
      recentTransactions: metrics.recentTransactions,
      averageTransactionValue: metrics.averageTransactionValue,
      financialHealthScore: metrics.financialHealthScore,
      monthlyData: metrics.monthlyData
    };

    const proof = await generateProof(
      proofName,
      includedData,
      financialMetrics,
      sharedWith || undefined,
      sharedWithEmail || undefined,
      expiresInDays
    );

    if (proof) {
      setProofName("");
      setSharedWith("");
      setSharedWithEmail("");
      setExpiresInDays(30);
      setSelectedItems(["revenue_summary", "expense_summary"]);
      setIsDialogOpen(false);
    }
  };

  const activeProofs = proofs.filter(p => p.status === 'active');
  const expiredOrRevokedProofs = proofs.filter(p => p.status !== 'active');

  // Calculate credibility score based on data availability and proofs
  const credibilityScore = hasData 
    ? Math.min(95, 60 + (activeProofs.length * 5) + (metrics.financialHealthScore / 10))
    : 0;

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Building";
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Credibility" 
        subtitle="Create blockchain-verified proofs of your financial health"
        showSearch={false}
      />
      
      <div className="p-6 space-y-8">
        {/* Credibility Score */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#credibilityGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - credibilityScore / 100)}
                />
                <defs>
                  <linearGradient id="credibilityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(38 92% 50%)" />
                    <stop offset="100%" stopColor="hsl(152 69% 40%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{Math.round(credibilityScore)}</span>
                <span className="text-sm text-primary-foreground/70">{getScoreLabel(credibilityScore)}</span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Your Credibility Score</h2>
              <p className="text-primary-foreground/70 mb-4 max-w-xl">
                Your financial credibility score is based on verified documents, 
                transaction history, compliance status, and active blockchain proofs.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {hasData && (
                  <>
                    <span className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                      ✓ Financial Data Available
                    </span>
                    {metrics.vatCollected > 0 && (
                      <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
                        ✓ VAT Collected
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-info/20 text-info text-sm font-medium">
                      ✓ {activeProofs.length} Active Proofs
                    </span>
                  </>
                )}
                {!hasData && (
                  <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-sm font-medium">
                    Upload documents to build credibility
                  </span>
                )}
              </div>
              
              {/* Score Details Toggle */}
              <Button 
                variant="ghost" 
                className="mt-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                {showBreakdown ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Score Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    How is this calculated?
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Score Breakdown - Collapsible */}
          {showBreakdown && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-6">
                <ScoreBreakdown 
                  hasData={hasData}
                  activeProofsCount={activeProofs.length}
                  financialHealthScore={metrics.financialHealthScore}
                  vatCollected={metrics.vatCollected}
                  documentCount={metrics.documentCount}
                  profitMargin={metrics.totalRevenue > 0 ? ((metrics.totalRevenue - metrics.totalExpenses) / metrics.totalRevenue) * 100 : 0}
                />
              </div>
            </div>
          )}
        </div>

        {/* Create Verification Proof */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Create Verification Proof</h3>
                <p className="text-sm text-muted-foreground">Select data to include in your blockchain proof</p>
              </div>
            </div>

            {!hasData ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Upload financial documents first to create verification proofs</p>
                <Button variant="outline" onClick={() => window.location.href = '/documents'}>
                  Go to Documents
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {verificationItemsBase.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                        selectedItems.includes(item.id)
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          selectedItems.includes(item.id)
                            ? "border-accent bg-accent"
                            : "border-muted-foreground"
                        )}>
                          {selectedItems.includes(item.id) && (
                            <CheckCircle className="w-3 h-3 text-accent-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="accent" className="w-full" disabled={selectedItems.length === 0}>
                      <Lock className="w-4 h-4 mr-2" />
                      Generate Blockchain Proof
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Verification Proof</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="proofName">Proof Name *</Label>
                        <Input 
                          id="proofName"
                          placeholder="e.g., Loan Application Proof"
                          value={proofName}
                          onChange={(e) => setProofName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sharedWith">Share With (Optional)</Label>
                        <Input 
                          id="sharedWith"
                          placeholder="e.g., Himalayan Bank Ltd"
                          value={sharedWith}
                          onChange={(e) => setSharedWith(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sharedWithEmail">Their Email (Optional)</Label>
                        <Input 
                          id="sharedWithEmail"
                          type="email"
                          placeholder="e.g., loans@himalayanbank.com"
                          value={sharedWithEmail}
                          onChange={(e) => setSharedWithEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiresIn">Expires In (Days)</Label>
                        <Input 
                          id="expiresIn"
                          type="number"
                          min={1}
                          max={365}
                          value={expiresInDays}
                          onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
                        />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">
                          <strong>Selected Data:</strong> {selectedItems.map(id => 
                            verificationItemsBase.find(v => v.id === id)?.name
                          ).join(", ")}
                        </p>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleGenerateProof}
                        disabled={isGenerating || !proofName.trim()}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Create Proof
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>

          {/* How It Works */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">How Blockchain Verification Works</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Select Financial Data</p>
                  <p className="text-sm text-muted-foreground">Choose which verified financial metrics to include</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Generate Cryptographic Hash</p>
                  <p className="text-sm text-muted-foreground">Your data is hashed using SHA-256 without exposing raw details</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Store on Sepolia Blockchain</p>
                  <p className="text-sm text-muted-foreground">Proof hash is immutably recorded on Ethereum Sepolia testnet</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent">4</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Share Verification Link</p>
                  <p className="text-sm text-muted-foreground">Banks & partners can verify your claims instantly</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Privacy First:</strong> Only cryptographic hashes are stored on-chain. 
                Your actual financial data never leaves our secure servers.
              </p>
            </div>
          </div>
        </div>

        {/* Active Proofs */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Verification Proofs</h3>
          {proofsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : proofs.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No verification proofs yet. Create your first proof above.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Proof</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Shared With</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Expires</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {proofs.map((proof) => (
                    <tr key={proof.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{proof.proof_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {proof.tx_hash ? `${proof.tx_hash.slice(0, 10)}...${proof.tx_hash.slice(-8)}` : 'Pending'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground hidden sm:table-cell">
                        {proof.shared_with || '-'}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground hidden md:table-cell">
                        {format(new Date(proof.expires_at), 'MMM d, yyyy')}
                      </td>
                      <td className="py-4 px-4">
                        {proof.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : proof.status === "revoked" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {proof.verification_url && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => copyVerificationLink(proof.verification_url!)}
                              title="Copy verification link"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          {proof.tx_hash && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => viewOnBlockchain(proof.tx_hash!)}
                              title="View on blockchain explorer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          {proof.status === "active" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => revokeProof(proof.id)}
                              title="Revoke proof"
                              className="text-destructive hover:text-destructive"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Credibility;
