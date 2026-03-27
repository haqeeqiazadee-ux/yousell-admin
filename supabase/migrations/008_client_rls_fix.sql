-- Add client RLS policy for product_requests (was missing)
-- Clients should be able to create and view their own requests

DROP POLICY IF EXISTS "Clients can manage own requests" ON product_requests;
CREATE POLICY "Clients can manage own requests" ON product_requests
  FOR ALL USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON p.email = c.email
      WHERE p.id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed 13 AI affiliate programs from build brief Section 7
INSERT INTO affiliate_programs (name, platform, commission_rate, recurring, cookie_days, network, niche_tags) VALUES
  ('Jasper AI', 'jasper.ai', 30.00, true, 30, 'PartnerStack', ARRAY['ai', 'writing', 'marketing']),
  ('Copy.ai', 'copy.ai', 45.00, false, 60, 'Direct', ARRAY['ai', 'writing', 'copywriting']),
  ('Synthesia', 'synthesia.io', 25.00, true, 30, 'PartnerStack', ARRAY['ai', 'video', 'marketing']),
  ('Notion', 'notion.so', 50.00, false, 30, 'Direct', ARRAY['productivity', 'ai', 'templates']),
  ('Canva Pro', 'canva.com', 36.00, false, 30, 'Impact', ARRAY['design', 'ai', 'marketing']),
  ('Midjourney', 'midjourney.com', 0.00, false, 0, 'None', ARRAY['ai', 'image', 'art']),
  ('ChatGPT Plus', 'openai.com', 0.00, false, 0, 'None', ARRAY['ai', 'chatbot', 'productivity']),
  ('Descript', 'descript.com', 25.00, true, 30, 'PartnerStack', ARRAY['ai', 'video', 'audio']),
  ('Runway ML', 'runwayml.com', 20.00, false, 30, 'Direct', ARRAY['ai', 'video', 'creative']),
  ('Pictory', 'pictory.ai', 30.00, true, 30, 'PartnerStack', ARRAY['ai', 'video', 'marketing']),
  ('Writesonic', 'writesonic.com', 30.00, true, 60, 'Direct', ARRAY['ai', 'writing', 'seo']),
  ('Lumen5', 'lumen5.com', 25.00, true, 30, 'PartnerStack', ARRAY['ai', 'video', 'marketing']),
  ('Surfer SEO', 'surferseo.com', 25.00, true, 30, 'PartnerStack', ARRAY['ai', 'seo', 'content'])
ON CONFLICT DO NOTHING;
