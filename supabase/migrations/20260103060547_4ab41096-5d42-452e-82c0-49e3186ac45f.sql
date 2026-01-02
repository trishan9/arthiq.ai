-- Create verification proofs table for blockchain-based credibility system
CREATE TABLE public.verification_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  proof_name TEXT NOT NULL,
  proof_hash TEXT NOT NULL,
  tx_hash TEXT,
  blockchain_network TEXT DEFAULT 'polygon',
  included_data JSONB NOT NULL,
  shared_with TEXT,
  shared_with_email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verification_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.verification_proofs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since no auth yet)
CREATE POLICY "Allow all operations on verification_proofs"
ON public.verification_proofs
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_verification_proofs_updated_at
BEFORE UPDATE ON public.verification_proofs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for verification_proofs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_proofs;