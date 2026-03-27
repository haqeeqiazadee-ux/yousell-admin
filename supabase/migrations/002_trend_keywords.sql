CREATE TABLE IF NOT EXISTS trend_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  volume INTEGER DEFAULT 0,
  growth NUMERIC(5,2) DEFAULT 0,
  source TEXT DEFAULT 'tiktok',
  scan_id UUID REFERENCES scans(id),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trend_keywords_keyword ON trend_keywords(keyword);
CREATE INDEX idx_trend_keywords_fetched_at ON trend_keywords(fetched_at);
