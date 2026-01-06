import { useState } from "react";

export interface Lender {
  id: string;
  name: string;
  organization_type:
    | "bank"
    | "microfinance"
    | "cooperative"
    | "business"
    | "investor";
  description: string | null;
  logo_url: string | null;
  website: string | null;
  contact_email: string | null;
  is_verified: boolean;
  criteria?: EligibilityCriteria[];
}

export interface EligibilityCriteria {
  id: string;
  lender_id: string;
  name: string;
  description: string | null;
  min_credibility_score: number;
  min_trust_tier: number;
  required_document_types: string[];
  min_monthly_revenue: number;
  min_business_age_months: number;
  max_anomaly_count: number;
  custom_requirements: Record<string, any>;
}

export interface SMEProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string | null;
  registration_number: string | null;
  established_date: string | null;
  credibility_score: number;
  trust_tier: number;
  evidence_quality_score: number;
  stability_score: number;
  compliance_score: number;
  anomaly_count: number;
  total_documents: number;
  is_public: boolean;
  last_score_update: string;
}

export interface MarketplaceRequest {
  id: string;
  sme_id: string;
  lender_id: string;
  criteria_id: string | null;
  request_type: "loan" | "partnership";
  status: "pending" | "accepted" | "rejected" | "expired";
  amount_requested: number | null;
  purpose: string | null;
  message: string | null;
  lender_response: string | null;
  credibility_snapshot: Record<string, any> | null;
  created_at: string;
  lender?: Lender;
  sme?: SMEProfile;
}

export interface MarketplaceInvitation {
  id: string;
  lender_id: string;
  sme_id: string;
  criteria_id: string | null;
  invitation_type: "loan" | "partnership";
  status: "pending" | "accepted" | "rejected" | "expired";
  message: string | null;
  offer_details: Record<string, any> | null;
  sme_response: string | null;
  expires_at: string | null;
  created_at: string;
  lender?: Lender;
  sme?: SMEProfile;
}

// Mock data for demo purposes since we don't have auth yet
const mockLenders: Lender[] = [
  {
    id: "0",
    name: "Quick Start Finance",
    organization_type: "microfinance",
    description:
      "Beginner-friendly lender with minimal requirements. Perfect for new businesses starting their credibility journey.",
    logo_url: null,
    website: "https://quickstart.np",
    contact_email: "hello@quickstart.np",
    is_verified: true,
    criteria: [
      {
        id: "0a",
        lender_id: "0",
        name: "Starter Loan",
        description:
          "Easy approval for new businesses - no document requirements",
        min_credibility_score: 40,
        min_trust_tier: 0,
        required_document_types: [],
        min_monthly_revenue: 0,
        min_business_age_months: 0,
        max_anomaly_count: 10,
        custom_requirements: {},
      },
    ],
  },
  {
    id: "1",
    name: "Nepal Bank Limited",
    organization_type: "bank",
    description:
      "Leading commercial bank in Nepal offering SME-focused financial solutions with competitive interest rates.",
    logo_url: null,
    website: "https://nepalbank.com.np",
    contact_email: "sme@nepalbank.com.np",
    is_verified: true,
    criteria: [
      {
        id: "1a",
        lender_id: "1",
        name: "SME Growth Loan",
        description: "For established businesses looking to expand",
        min_credibility_score: 70,
        min_trust_tier: 2,
        required_document_types: [
          "bank_statement",
          "vat_return",
          "audit_report",
        ],
        min_monthly_revenue: 500000,
        min_business_age_months: 24,
        max_anomaly_count: 3,
        custom_requirements: { collateral_required: true },
      },
      {
        id: "1b",
        lender_id: "1",
        name: "Working Capital Finance",
        description: "Short-term financing for operational needs",
        min_credibility_score: 55,
        min_trust_tier: 1,
        required_document_types: ["bank_statement", "invoice"],
        min_monthly_revenue: 200000,
        min_business_age_months: 12,
        max_anomaly_count: 5,
        custom_requirements: {},
      },
    ],
  },
  {
    id: "2",
    name: "Sunrise Microfinance",
    organization_type: "microfinance",
    description:
      "Empowering small businesses with accessible micro-loans and financial literacy support.",
    logo_url: null,
    website: "https://sunrisemf.com.np",
    contact_email: "loans@sunrisemf.com.np",
    is_verified: true,
    criteria: [
      {
        id: "2a",
        lender_id: "2",
        name: "Micro Business Loan",
        description: "Accessible loans for micro-enterprises",
        min_credibility_score: 40,
        min_trust_tier: 1,
        required_document_types: ["sales_record"],
        min_monthly_revenue: 50000,
        min_business_age_months: 6,
        max_anomaly_count: 8,
        custom_requirements: {},
      },
    ],
  },
  {
    id: "3",
    name: "Himalayan Cooperative",
    organization_type: "cooperative",
    description:
      "Community-based cooperative offering favorable terms for local SMEs in the Himalayan region.",
    logo_url: null,
    website: null,
    contact_email: "info@himalayancooperative.np",
    is_verified: false,
    criteria: [
      {
        id: "3a",
        lender_id: "3",
        name: "Community Business Fund",
        description: "Low-interest loans for community businesses",
        min_credibility_score: 50,
        min_trust_tier: 1,
        required_document_types: ["bank_statement"],
        min_monthly_revenue: 100000,
        min_business_age_months: 12,
        max_anomaly_count: 6,
        custom_requirements: { member_only: true },
      },
    ],
  },
  {
    id: "4",
    name: "Everest Capital Partners",
    organization_type: "investor",
    description:
      "Venture capital firm focused on high-growth SMEs in Nepal with mentorship and network support.",
    logo_url: null,
    website: "https://everestcapital.np",
    contact_email: "invest@everestcapital.np",
    is_verified: true,
    criteria: [
      {
        id: "4a",
        lender_id: "4",
        name: "Growth Equity",
        description: "Equity investment for scaling businesses",
        min_credibility_score: 80,
        min_trust_tier: 3,
        required_document_types: [
          "audit_report",
          "bank_statement",
          "vat_return",
          "business_plan",
        ],
        min_monthly_revenue: 1000000,
        min_business_age_months: 36,
        max_anomaly_count: 1,
        custom_requirements: { equity_stake: "10-25%" },
      },
    ],
  },
  {
    id: "5",
    name: "Kathmandu Trade Alliance",
    organization_type: "business",
    description:
      "Business network offering partnership opportunities with established enterprises in the Kathmandu valley.",
    logo_url: null,
    website: "https://ktmtrade.np",
    contact_email: "partnerships@ktmtrade.np",
    is_verified: true,
    criteria: [
      {
        id: "5a",
        lender_id: "5",
        name: "Supply Chain Partnership",
        description: "Become a verified supplier for large retailers",
        min_credibility_score: 65,
        min_trust_tier: 2,
        required_document_types: ["vat_return", "invoice"],
        min_monthly_revenue: 300000,
        min_business_age_months: 18,
        max_anomaly_count: 4,
        custom_requirements: { product_categories: "retail" },
      },
    ],
  },
];

const mockLeaderboard: SMEProfile[] = [
  {
    id: "sme1",
    user_id: "u1",
    business_name: "Himalayan Handicrafts Pvt. Ltd.",
    business_type: "Manufacturing",
    registration_number: "REG-2019-001234",
    established_date: "2019-03-15",
    credibility_score: 87,
    trust_tier: 3,
    evidence_quality_score: 92,
    stability_score: 85,
    compliance_score: 84,
    anomaly_count: 0,
    total_documents: 45,
    is_public: true,
    last_score_update: new Date().toISOString(),
  },
  {
    id: "sme2",
    user_id: "u2",
    business_name: "Pokhara Fresh Foods",
    business_type: "Retail",
    registration_number: "REG-2020-005678",
    established_date: "2020-07-20",
    credibility_score: 78,
    trust_tier: 2,
    evidence_quality_score: 82,
    stability_score: 76,
    compliance_score: 75,
    anomaly_count: 2,
    total_documents: 32,
    is_public: true,
    last_score_update: new Date().toISOString(),
  },
  {
    id: "sme3",
    user_id: "u3",
    business_name: "TechHub Nepal",
    business_type: "IT Services",
    registration_number: "REG-2021-009012",
    established_date: "2021-01-10",
    credibility_score: 72,
    trust_tier: 2,
    evidence_quality_score: 78,
    stability_score: 70,
    compliance_score: 68,
    anomaly_count: 1,
    total_documents: 28,
    is_public: true,
    last_score_update: new Date().toISOString(),
  },
  {
    id: "sme4",
    user_id: "u4",
    business_name: "Bhaktapur Textiles",
    business_type: "Manufacturing",
    registration_number: "REG-2018-003456",
    established_date: "2018-05-08",
    credibility_score: 68,
    trust_tier: 2,
    evidence_quality_score: 70,
    stability_score: 72,
    compliance_score: 62,
    anomaly_count: 3,
    total_documents: 38,
    is_public: true,
    last_score_update: new Date().toISOString(),
  },
  {
    id: "sme5",
    user_id: "u5",
    business_name: "Mountain Coffee Roasters",
    business_type: "Food & Beverage",
    registration_number: "REG-2022-007890",
    established_date: "2022-02-28",
    credibility_score: 55,
    trust_tier: 1,
    evidence_quality_score: 60,
    stability_score: 52,
    compliance_score: 53,
    anomaly_count: 4,
    total_documents: 15,
    is_public: true,
    last_score_update: new Date().toISOString(),
  },
  {
    id: "sme6",
    user_id: "u6",
    business_name: "Chitwan Agro Exports",
    business_type: "Agriculture",
    registration_number: "REG-2020-002345",
    established_date: "2020-09-12",
    credibility_score: 45,
    trust_tier: 1,
    evidence_quality_score: 48,
    stability_score: 45,
    compliance_score: 42,
    anomaly_count: 6,
    total_documents: 12,
    is_public: true,
    last_score_update: new Date().toISOString(),
  },
];

export function useMarketplace() {
  const [lenders, setLenders] = useState<Lender[]>(mockLenders);
  const [leaderboard, setLeaderboard] = useState<SMEProfile[]>(mockLeaderboard);
  const [requests, setRequests] = useState<MarketplaceRequest[]>([]);
  const [invitations, setInvitations] = useState<MarketplaceInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if an SME meets a lender's criteria
  const checkEligibility = (
    sme: SMEProfile,
    criteria: EligibilityCriteria
  ): {
    eligible: boolean;
    matchPercentage: number;
    missingRequirements: string[];
  } => {
    const missingRequirements: string[] = [];
    let matchedCriteria = 0;
    const totalCriteria = 6;

    if (sme.credibility_score >= criteria.min_credibility_score) {
      matchedCriteria++;
    } else {
      missingRequirements.push(
        `Credibility score: ${sme.credibility_score}/${criteria.min_credibility_score}`
      );
    }

    if (sme.trust_tier >= criteria.min_trust_tier) {
      matchedCriteria++;
    } else {
      missingRequirements.push(
        `Trust tier: ${sme.trust_tier}/${criteria.min_trust_tier}`
      );
    }

    if (sme.anomaly_count <= criteria.max_anomaly_count) {
      matchedCriteria++;
    } else {
      missingRequirements.push(
        `Anomalies: ${sme.anomaly_count} (max ${criteria.max_anomaly_count})`
      );
    }

    // Check document types (simplified - assume documents meet requirements based on total)
    const hasEnoughDocs =
      sme.total_documents >= criteria.required_document_types.length * 2;
    if (hasEnoughDocs) {
      matchedCriteria++;
    } else {
      missingRequirements.push(
        `Required documents: ${criteria.required_document_types.join(", ")}`
      );
    }

    // Business age check
    if (sme.established_date) {
      const monthsOld = Math.floor(
        (Date.now() - new Date(sme.established_date).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      );
      if (monthsOld >= criteria.min_business_age_months) {
        matchedCriteria++;
      } else {
        missingRequirements.push(
          `Business age: ${monthsOld}/${criteria.min_business_age_months} months`
        );
      }
    } else {
      missingRequirements.push(
        `Business age: Not specified (${criteria.min_business_age_months} months required)`
      );
    }

    // Revenue check (simplified - estimate based on stability score)
    const estimatedRevenue = sme.stability_score * 10000;
    if (estimatedRevenue >= criteria.min_monthly_revenue) {
      matchedCriteria++;
    } else {
      missingRequirements.push(
        `Monthly revenue: NPR ${estimatedRevenue.toLocaleString()}/${criteria.min_monthly_revenue.toLocaleString()}`
      );
    }

    const matchPercentage = Math.round((matchedCriteria / totalCriteria) * 100);
    const eligible = matchPercentage === 100;

    return { eligible, matchPercentage, missingRequirements };
  };

  // Create a loan/partnership request
  const createRequest = async (
    smeId: string,
    lenderId: string,
    criteriaId: string | null,
    requestType: "loan" | "partnership",
    details: { amount?: number; purpose?: string; message?: string }
  ) => {
    const newRequest: MarketplaceRequest = {
      id: `req_${Date.now()}`,
      sme_id: smeId,
      lender_id: lenderId,
      criteria_id: criteriaId,
      request_type: requestType,
      status: "pending",
      amount_requested: details.amount || null,
      purpose: details.purpose || null,
      message: details.message || null,
      lender_response: null,
      credibility_snapshot: null,
      created_at: new Date().toISOString(),
    };
    setRequests((prev) => [...prev, newRequest]);
    return newRequest;
  };

  // Accept/reject a request (for lenders)
  const updateRequestStatus = async (
    requestId: string,
    status: "accepted" | "rejected",
    response?: string
  ) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status, lender_response: response || null }
          : req
      )
    );
  };

  // Create an invitation (for lenders)
  const createInvitation = async (
    lenderId: string,
    smeId: string,
    criteriaId: string | null,
    invitationType: "loan" | "partnership",
    details: {
      message?: string;
      offerDetails?: Record<string, any>;
      expiresAt?: string;
    }
  ) => {
    const newInvitation: MarketplaceInvitation = {
      id: `inv_${Date.now()}`,
      lender_id: lenderId,
      sme_id: smeId,
      criteria_id: criteriaId,
      invitation_type: invitationType,
      status: "pending",
      message: details.message || null,
      offer_details: details.offerDetails || null,
      sme_response: null,
      expires_at: details.expiresAt || null,
      created_at: new Date().toISOString(),
    };
    setInvitations((prev) => [...prev, newInvitation]);
    return newInvitation;
  };

  // Accept/reject an invitation (for SMEs)
  const updateInvitationStatus = async (
    invitationId: string,
    status: "accepted" | "rejected",
    response?: string
  ) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? { ...inv, status, sme_response: response || null }
          : inv
      )
    );
  };

  // Get leaderboard filtered by criteria
  const getFilteredLeaderboard = (criteria?: EligibilityCriteria) => {
    if (!criteria) return leaderboard;

    return leaderboard
      .map((sme) => ({
        sme,
        ...checkEligibility(sme, criteria),
      }))
      .sort((a, b) => {
        // First sort by eligibility, then by match percentage, then by credibility score
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        if (a.matchPercentage !== b.matchPercentage)
          return b.matchPercentage - a.matchPercentage;
        return b.sme.credibility_score - a.sme.credibility_score;
      });
  };

  return {
    lenders,
    leaderboard,
    requests,
    invitations,
    isLoading,
    checkEligibility,
    createRequest,
    updateRequestStatus,
    createInvitation,
    updateInvitationStatus,
    getFilteredLeaderboard,
  };
}
