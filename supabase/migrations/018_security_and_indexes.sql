-- Migration 018: Security fixes and performance indexes
-- BUG-049: Add missing indexes on products table for common query patterns

CREATE INDEX IF NOT EXISTS idx_products_name ON products (title);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products (platform);
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
CREATE INDEX IF NOT EXISTS idx_products_final_score ON products (final_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_trend_stage ON products (trend_stage);

-- Composite index for common admin query: platform + status + score
CREATE INDEX IF NOT EXISTS idx_products_platform_status_score ON products (platform, status, final_score DESC);
