-- Add unique constraint on products for upsert support (source + external_id)
ALTER TABLE products ADD CONSTRAINT products_source_external_id_unique UNIQUE (source, external_id);

-- Add index on products.created_at for cache queries
CREATE INDEX IF NOT EXISTS idx_products_source_created_at ON products(source, created_at DESC);

-- Add index on allocations for tier limit queries
CREATE INDEX IF NOT EXISTS idx_allocations_client_status ON allocations(client_id, status);

-- Add index on scans.job_id for worker lookups
CREATE INDEX IF NOT EXISTS idx_scans_job_id ON scans(job_id);
