-- Order Tracking Enhancements
-- Add unique constraint for webhook upsert on external_order_id + platform
-- This allows webhook handlers to upsert orders without duplicates

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_external_order_platform_unique'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_external_order_platform_unique
      UNIQUE (external_order_id, platform);
  END IF;
END $$;

-- Index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_external_order_platform
  ON orders (external_order_id, platform);
