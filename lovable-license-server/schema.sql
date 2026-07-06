-- Create the Licenses table
CREATE TABLE licenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT UNIQUE NOT NULL,
  duration_days INTEGER NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE,
  bound_machine_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast key lookups
CREATE INDEX idx_license_key ON licenses(license_key);
