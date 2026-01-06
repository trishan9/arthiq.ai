import { useState, useMemo } from "react";
import {
  Building2,
  Filter,
  Search,
  LayoutGrid,
  List,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useMarketplace,
  Lender,
  EligibilityCriteria,
  SMEProfile,
  MarketplaceRequest,
} from "@/hooks/useMarketplace";
import { useCredibilityScore } from "@/hooks/use-credibility-score";
import { useFinancialData } from "@/hooks/useFinancialData";
import { LenderCard } from "@/components/marketplace/LenderCard";
import { SMELeaderboard } from "@/components/marketplace/SMELeaderboard";
import { EligibilityDetailDialog } from "@/components/marketplace/EligibilityDetailDialog";
import { RequestDialog } from "@/components/marketplace/RequestDialog";
import { RequestsPanel } from "@/components/marketplace/RequestsPanel";
import { CredibilityPacketDialog } from "@/components/marketplace/CredibilityPacketDialog";
import { VerificationFlowDialog } from "@/components/marketplace/VerificationFlowDialog";
import { useToast } from "@/hooks/use-toast";

export default function Marketplace() {
  const {
    lenders,
    requests,
    invitations,
    checkEligibility,
    createRequest,
    getFilteredLeaderboard,
    updateInvitationStatus,
    updateRequestStatus,
  } = useMarketplace();
  const { credibilityScore } = useCredibilityScore();
  const { metrics } = useFinancialData();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [orgTypeFilter, setOrgTypeFilter] = useState<string>("all");
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [selectedCriteria, setSelectedCriteria] =
    useState<EligibilityCriteria | null>(null);
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showPacketDialog, setShowPacketDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MarketplaceRequest | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock current SME profile based on credibility data
  const currentSME: SMEProfile = useMemo(
    () => ({
      id: "current",
      user_id: "current_user",
      business_name: "My Business",
      business_type: "Retail",
      registration_number: null,
      established_date: "2022-01-01",
      credibility_score: credibilityScore?.totalScore || 0,
      trust_tier: credibilityScore?.trustTier.tier || 0,
      evidence_quality_score: credibilityScore?.evidenceQuality.score || 0,
      stability_score: credibilityScore?.stabilityGrowth.score || 0,
      compliance_score: credibilityScore?.complianceReadiness.score || 0,
      anomaly_count: credibilityScore?.anomalies.length || 0,
      total_documents: 0,
      is_public: true,
      last_score_update: new Date().toISOString(),
    }),
    [credibilityScore]
  );

  // Filter lenders
  const filteredLenders = useMemo(() => {
    return lenders.filter((lender) => {
      const matchesSearch =
        lender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lender.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        orgTypeFilter === "all" || lender.organization_type === orgTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [lenders, searchQuery, orgTypeFilter]);

  // Get filtered leaderboard - always returns the enhanced format
  const filteredLeaderboard = useMemo(() => {
    const result = getFilteredLeaderboard(selectedCriteria || undefined);
    // Ensure we always have the full format with sme, eligible, matchPercentage, missingRequirements
    if (result.length > 0 && "sme" in result[0]) {
      return result as Array<{
        sme: SMEProfile;
        eligible: boolean;
        matchPercentage: number;
        missingRequirements: string[];
      }>;
    }
    // If no criteria selected, wrap SME profiles in the expected format
    return (result as SMEProfile[]).map((sme) => ({
      sme,
      eligible: true,
      matchPercentage: 100,
      missingRequirements: [],
    }));
  }, [selectedCriteria, getFilteredLeaderboard]);

  // Check eligibility for current user
  const currentEligibility = useMemo(() => {
    if (!selectedCriteria) return undefined;
    return checkEligibility(currentSME, selectedCriteria);
  }, [selectedCriteria, currentSME, checkEligibility]);

  const handleSelectCriteria = (
    lender: Lender,
    criteria: EligibilityCriteria
  ) => {
    setSelectedLender(lender);
    setSelectedCriteria(criteria);
    setShowEligibilityDialog(true);
  };

  const handleApply = () => {
    setShowEligibilityDialog(false);
    setShowRequestDialog(true);
  };

  const handleSubmitRequest = async (data: {
    requestType: "loan" | "partnership";
    amount?: number;
    purpose?: string;
    message?: string;
  }) => {
    if (!selectedLender) return;
    await createRequest(
      currentSME.id,
      selectedLender.id,
      selectedCriteria?.id || null,
      data.requestType,
      data
    );
  };

  const handleAcceptInvitation = async (invitation: any) => {
    await updateInvitationStatus(invitation.id, "accepted");
  };

  const handleRejectInvitation = async (invitation: any) => {
    await updateInvitationStatus(invitation.id, "rejected");
  };

  const handleViewRequest = (request: MarketplaceRequest) => {
    setSelectedRequest(request);
    const lender = lenders.find((l) => l.id === request.lender_id);
    setSelectedLender(lender || null);
    setShowVerificationDialog(true);
  };

  const handleApproveRequest = async (response: string) => {
    if (!selectedRequest) return;
    await updateRequestStatus(selectedRequest.id, "accepted", response);
    toast({
      title: "Request Approved",
      description: "The credibility packet has been shared with the lender.",
    });
  };

  const handleRejectRequest = async (response: string) => {
    if (!selectedRequest) return;
    await updateRequestStatus(selectedRequest.id, "rejected", response);
    toast({
      title: "Request Rejected",
      description: "The request has been declined.",
    });
  };

  const handleViewPacketFromVerification = () => {
    setShowVerificationDialog(false);
    setShowPacketDialog(true);
  };

  const handleOpenPacketPreview = () => {
    if (selectedLender) {
      setShowPacketDialog(true);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Lender Marketplace
          </h1>
          <p className="text-muted-foreground">
            Connect with banks, investors, and partners based on your
            credibility score
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Credibility Packet Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedLender(lenders[0] || null);
              setShowPacketDialog(true);
            }}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Preview Packet
          </Button>

          {/* Current Score Badge */}
          {credibilityScore && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
              <span className="text-sm text-muted-foreground">Your Score:</span>
              <span className="text-2xl font-bold text-primary">
                {credibilityScore.totalScore}
              </span>
              <Badge variant="outline" className="text-xs">
                Tier {credibilityScore.trustTier.tier}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="lenders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lenders">Browse Lenders</TabsTrigger>
          <TabsTrigger value="leaderboard">SME Leaderboard</TabsTrigger>
          <TabsTrigger value="my-requests">
            My Requests
            {requests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {requests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Lenders Tab */}
        <TabsContent value="lenders" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={orgTypeFilter} onValueChange={setOrgTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bank">Banks</SelectItem>
                <SelectItem value="microfinance">Microfinance</SelectItem>
                <SelectItem value="cooperative">Cooperatives</SelectItem>
                <SelectItem value="investor">Investors</SelectItem>
                <SelectItem value="business">Businesses</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lender Cards */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            {filteredLenders.map((lender) => (
              <LenderCard
                key={lender.id}
                lender={lender}
                onSelectCriteria={handleSelectCriteria}
              />
            ))}
          </div>

          {filteredLenders.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  No lenders found matching your criteria
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <Select
              value={selectedCriteria?.id || "all"}
              onValueChange={(v) => {
                if (v === "all") {
                  setSelectedCriteria(null);
                  setSelectedLender(null);
                } else {
                  const criteria = lenders
                    .flatMap(
                      (l) => l.criteria?.map((c) => ({ ...c, lender: l })) || []
                    )
                    .find((c) => c.id === v);
                  if (criteria) {
                    setSelectedCriteria(criteria);
                    setSelectedLender(criteria.lender);
                  }
                }
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Filter by eligibility criteria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SMEs (No Filter)</SelectItem>
                {lenders.map((lender) =>
                  lender.criteria?.map((criteria) => (
                    <SelectItem key={criteria.id} value={criteria.id}>
                      {lender.name} - {criteria.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {selectedCriteria && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCriteria(null);
                  setSelectedLender(null);
                }}
              >
                Clear Filter
              </Button>
            )}
          </div>

          <SMELeaderboard
            leaderboard={filteredLeaderboard}
            selectedCriteria={selectedCriteria || undefined}
            onViewProfile={(sme) => console.log("View profile:", sme)}
            onInviteSME={(sme) => console.log("Invite SME:", sme)}
          />
        </TabsContent>

        {/* My Requests Tab */}
        <TabsContent value="my-requests">
          <RequestsPanel
            requests={requests}
            invitations={invitations}
            lenders={lenders}
            onViewRequest={handleViewRequest}
            onAcceptInvitation={handleAcceptInvitation}
            onRejectInvitation={handleRejectInvitation}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EligibilityDetailDialog
        open={showEligibilityDialog}
        onOpenChange={setShowEligibilityDialog}
        lender={selectedLender}
        criteria={selectedCriteria}
        currentSME={currentSME}
        eligibilityResult={currentEligibility}
        onApply={handleApply}
        onViewLeaderboard={() => {
          setShowEligibilityDialog(false);
        }}
      />

      <RequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        lender={selectedLender}
        criteria={selectedCriteria}
        onSubmit={handleSubmitRequest}
      />

      <CredibilityPacketDialog
        open={showPacketDialog}
        onOpenChange={setShowPacketDialog}
        credibilityScore={credibilityScore}
        metrics={metrics}
        businessName={currentSME.business_name}
        lenderName={selectedLender?.name || "Lender"}
        requestType={selectedRequest?.request_type || "loan"}
        requestedAmount={selectedRequest?.amount_requested || undefined}
      />

      <VerificationFlowDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        request={selectedRequest}
        smeProfile={currentSME}
        credibilityScore={credibilityScore}
        lender={selectedLender}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        onViewPacket={handleViewPacketFromVerification}
      />
    </div>
  );
}
