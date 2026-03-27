-- ============================================================
-- 012_product_clusters.sql
-- Phase 2 — Product Intelligence: clustering table
-- ============================================================

CREATE TABLE IF NOT EXISTS product_clusters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  keywords        text[] DEFAULT '{}',
  product_count   integer DEFAULT 0,
  avg_score       numeric(5,2) DEFAULT 0,
  platforms       text[] DEFAULT '{}',
  trend_stage     text DEFAULT 'emerging',

  -- Cluster-level metrics
  total_views     bigint DEFAULT 0,
  total_sales     bigint DEFAULT 0,
  price_range_min numeric(10,2) DEFAULT 0,
  price_range_max numeric(10,2) DEFAULT 0,

  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),

  CONSTRAINT product_clusters_name_key UNIQUE (name)
);

-- Junction table: product ↔ cluster
CREATE TABLE IF NOT EXISTS product_cluster_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id  uuid NOT NULL REFERENCES product_clusters(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  similarity  numeric(5,4) DEFAULT 0,
  added_at    timestamptz DEFAULT now(),

  CONSTRAINT product_cluster_members_unique UNIQUE (cluster_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_clusters_trend ON product_clusters (trend_stage);
CREATE INDEX IF NOT EXISTS idx_product_clusters_score ON product_clusters (avg_score DESC);
CREATE INDEX IF NOT EXISTS idx_cluster_members_product ON product_cluster_members (product_id);
CREATE INDEX IF NOT EXISTS idx_cluster_members_cluster ON product_cluster_members (cluster_id);

ALTER TABLE product_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_cluster_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_clusters" ON product_clusters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

CREATE POLICY "admin_read_cluster_members" ON product_cluster_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );
