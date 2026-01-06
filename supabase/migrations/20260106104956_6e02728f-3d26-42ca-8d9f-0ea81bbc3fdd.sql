-- Add verification_type column to distinguish self-attested vs externally verified
ALTER TABLE public.verification_proofs 
ADD COLUMN IF NOT EXISTS verification_type text NOT NULL DEFAULT 'self-attested';

-- Add verifier information
ALTER TABLE public.verification_proofs 
ADD COLUMN IF NOT EXISTS verified_by_lender_id uuid REFERENCES public.lenders(id);

ALTER TABLE public.verification_proofs 
ADD COLUMN IF NOT EXISTS verifier_name text;

ALTER TABLE public.verification_proofs 
ADD COLUMN IF NOT EXISTS verifier_notes text;

-- Add verification_request_id to link to marketplace_requests
ALTER TABLE public.verification_proofs 
ADD COLUMN IF NOT EXISTS marketplace_request_id uuid REFERENCES public.marketplace_requests(id);

-- Add verification fields to marketplace_requests
ALTER TABLE public.marketplace_requests 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'not_requested';

ALTER TABLE public.marketplace_requests 
ADD COLUMN IF NOT EXISTS verification_requested_at timestamp with time zone;

ALTER TABLE public.marketplace_requests 
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

ALTER TABLE public.marketplace_requests 
ADD COLUMN IF NOT EXISTS verification_notes text;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_proofs_type ON public.verification_proofs(verification_type);
CREATE INDEX IF NOT EXISTS idx_verification_proofs_verifier ON public.verification_proofs(verified_by_lender_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_verification ON public.marketplace_requests(verification_status);

-- Comment for clarity
COMMENT ON COLUMN public.verification_proofs.verification_type IS 'self-attested (SME generated) or lender-verified (externally verified by lender)';
COMMENT ON COLUMN public.marketplace_requests.verification_status IS 'not_requested, pending, verified, rejected';