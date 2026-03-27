-- Phase 5: Trends tracking
CREATE TABLE IF NOT EXISTS trend_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  category TEXT,
  volume INTEGER DEFAULT 0,
  trend_direction TEXT CHECK (trend_direction IN ('rising', 'stable', 'declining')) DEFAULT 'stable',
  trend_score INTEGER DEFAULT 0,
  related_keywords TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'pytrends',
  data JSONB DEFAULT '{}',
  last_checked_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE trend_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage trends" ON trend_keywords FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_trends_keyword ON trend_keywords(keyword);
CREATE INDEX idx_trends_score ON trend_keywords(trend_score DESC);
CREATE TRIGGER trends_updated_at BEFORE UPDATE ON trend_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Phase 6: Competitor tracking
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT,
  platform TEXT,
  category TEXT,
  notes TEXT,
  metrics JSONB DEFAULT '{}',
  last_analyzed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage competitors" ON competitors FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_competitors_name ON competitors(name);
CREATE TRIGGER competitors_updated_at BEFORE UPDATE ON competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
