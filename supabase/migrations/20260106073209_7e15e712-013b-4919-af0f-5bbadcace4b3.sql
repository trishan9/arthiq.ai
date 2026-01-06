-- Create enum for organization types
CREATE TYPE public.organization_type AS ENUM ('bank', 'microfinance', 'cooperative', 'business', 'investor');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- Create lenders/organizations table
CREATE TABLE public.lenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    organization_type organization_type NOT NULL DEFAULT 'bank',
    description TEXT,
    logo_url TEXT,
    website TEXT,
    contact_email TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create eligibility criteria table
CREATE TABLE public.eligibility_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_id UUID REFERENCES public.lenders(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    min_credibility_score INTEGER DEFAULT 0,
    min_trust_tier INTEGER DEFAULT 0,
    required_document_types TEXT[] DEFAULT '{}',
    min_monthly_revenue NUMERIC DEFAULT 0,
    min_business_age_months INTEGER DEFAULT 0,
    max_anomaly_count INTEGER DEFAULT 10,
    custom_requirements JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create SME profiles table (for leaderboard)
CREATE TABLE public.sme_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    business_type TEXT,
    registration_number TEXT,
    established_date DATE,
    address TEXT,
    phone TEXT,
    email TEXT,
    credibility_score INTEGER DEFAULT 0,
    trust_tier INTEGER DEFAULT 0,
    evidence_quality_score NUMERIC DEFAULT 0,
    stability_score NUMERIC DEFAULT 0,
    compliance_score NUMERIC DEFAULT 0,
    anomaly_count INTEGER DEFAULT 0,
    total_documents INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    last_score_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loan/partnership requests table
CREATE TABLE public.marketplace_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sme_id UUID REFERENCES public.sme_profiles(id) ON DELETE CASCADE NOT NULL,
    lender_id UUID REFERENCES public.lenders(id) ON DELETE CASCADE NOT NULL,
    criteria_id UUID REFERENCES public.eligibility_criteria(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('loan', 'partnership')),
    status request_status DEFAULT 'pending',
    amount_requested NUMERIC,
    purpose TEXT,
    message TEXT,
    lender_response TEXT,
    credibility_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table (lender invites SME)
CREATE TABLE public.marketplace_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_id UUID REFERENCES public.lenders(id) ON DELETE CASCADE NOT NULL,
    sme_id UUID REFERENCES public.sme_profiles(id) ON DELETE CASCADE NOT NULL,
    criteria_id UUID REFERENCES public.eligibility_criteria(id) ON DELETE SET NULL,
    invitation_type TEXT NOT NULL CHECK (invitation_type IN ('loan', 'partnership')),
    status request_status DEFAULT 'pending',
    message TEXT,
    offer_details JSONB,
    sme_response TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sme_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_invitations ENABLE ROW LEVEL SECURITY;

-- Lenders policies
CREATE POLICY "Anyone can view active lenders" ON public.lenders FOR SELECT USING (is_active = true);
CREATE POLICY "Lender owners can update their lender" ON public.lenders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create lenders" ON public.lenders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Eligibility criteria policies
CREATE POLICY "Anyone can view active criteria" ON public.eligibility_criteria FOR SELECT USING (is_active = true);
CREATE POLICY "Lender owners can manage criteria" ON public.eligibility_criteria FOR ALL USING (
    EXISTS (SELECT 1 FROM public.lenders WHERE id = lender_id AND user_id = auth.uid())
);

-- SME profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.sme_profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own profile" ON public.sme_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own profile" ON public.sme_profiles FOR ALL USING (auth.uid() = user_id);

-- Marketplace requests policies
CREATE POLICY "SMEs can view their requests" ON public.marketplace_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sme_profiles WHERE id = sme_id AND user_id = auth.uid())
);
CREATE POLICY "Lenders can view requests to them" ON public.marketplace_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.lenders WHERE id = lender_id AND user_id = auth.uid())
);
CREATE POLICY "SMEs can create requests" ON public.marketplace_requests FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.sme_profiles WHERE id = sme_id AND user_id = auth.uid())
);
CREATE POLICY "Lenders can update request status" ON public.marketplace_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.lenders WHERE id = lender_id AND user_id = auth.uid())
);

-- Marketplace invitations policies
CREATE POLICY "SMEs can view invitations to them" ON public.marketplace_invitations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sme_profiles WHERE id = sme_id AND user_id = auth.uid())
);
CREATE POLICY "Lenders can view their invitations" ON public.marketplace_invitations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.lenders WHERE id = lender_id AND user_id = auth.uid())
);
CREATE POLICY "Lenders can create invitations" ON public.marketplace_invitations FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.lenders WHERE id = lender_id AND user_id = auth.uid())
);
CREATE POLICY "SMEs can update invitation status" ON public.marketplace_invitations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.sme_profiles WHERE id = sme_id AND user_id = auth.uid())
);

-- Create updated_at triggers
CREATE TRIGGER update_lenders_updated_at BEFORE UPDATE ON public.lenders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eligibility_criteria_updated_at BEFORE UPDATE ON public.eligibility_criteria FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sme_profiles_updated_at BEFORE UPDATE ON public.sme_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketplace_requests_updated_at BEFORE UPDATE ON public.marketplace_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketplace_invitations_updated_at BEFORE UPDATE ON public.marketplace_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();