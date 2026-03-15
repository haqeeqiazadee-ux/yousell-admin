import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateAdmin } from '@/lib/auth/admin-api-auth';

/**
 * POST /api/admin/setup/migrate
 * Creates missing database tables required by the intelligence engines.
 * Uses raw SQL via Supabase's service-role client.
 * Only callable by admin users.
 */
export async function POST(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const admin = createAdminClient();
  const results: Array<{ table: string; status: string; error?: string }> = [];

  // Define each table creation as a separate SQL statement
  const migrations: Array<{ name: string; sql: string }> = [
    {
      name: 'tiktok_videos',
      sql: `
        CREATE TABLE IF NOT EXISTS tiktok_videos (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          video_id text NOT NULL,
          url text NOT NULL,
          description text,
          author_username text,
          author_id text,
          author_followers bigint DEFAULT 0,
          views bigint DEFAULT 0,
          likes bigint DEFAULT 0,
          shares bigint DEFAULT 0,
          comments bigint DEFAULT 0,
          hashtags text[] DEFAULT '{}',
          music_title text,
          thumbnail_url text,
          product_urls text[] DEFAULT '{}',
          has_product_link boolean DEFAULT false,
          discovery_query text,
          discovered_at timestamptz DEFAULT now(),
          create_time timestamptz,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          CONSTRAINT tiktok_videos_video_id_key UNIQUE (video_id)
        );
      `,
    },
    {
      name: 'tiktok_hashtag_signals',
      sql: `
        CREATE TABLE IF NOT EXISTS tiktok_hashtag_signals (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          hashtag text NOT NULL,
          total_videos integer DEFAULT 0,
          total_views bigint DEFAULT 0,
          total_likes bigint DEFAULT 0,
          total_shares bigint DEFAULT 0,
          total_comments bigint DEFAULT 0,
          unique_creators integer DEFAULT 0,
          video_growth_rate numeric(8,4) DEFAULT 0,
          view_velocity numeric(12,2) DEFAULT 0,
          creator_growth_rate numeric(8,4) DEFAULT 0,
          engagement_rate numeric(8,4) DEFAULT 0,
          product_video_pct numeric(5,2) DEFAULT 0,
          snapshot_at timestamptz NOT NULL DEFAULT now(),
          created_at timestamptz DEFAULT now(),
          CONSTRAINT tiktok_hashtag_signals_unique UNIQUE (hashtag, snapshot_at)
        );
      `,
    },
    {
      name: 'product_clusters',
      sql: `
        CREATE TABLE IF NOT EXISTS product_clusters (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          keywords text[] DEFAULT '{}',
          product_count integer DEFAULT 0,
          avg_score numeric(5,2) DEFAULT 0,
          platforms text[] DEFAULT '{}',
          trend_stage text DEFAULT 'emerging',
          total_views bigint DEFAULT 0,
          total_sales bigint DEFAULT 0,
          price_range_min numeric(10,2) DEFAULT 0,
          price_range_max numeric(10,2) DEFAULT 0,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          CONSTRAINT product_clusters_name_key UNIQUE (name)
        );
      `,
    },
    {
      name: 'product_cluster_members',
      sql: `
        CREATE TABLE IF NOT EXISTS product_cluster_members (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          cluster_id uuid NOT NULL REFERENCES product_clusters(id) ON DELETE CASCADE,
          product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          similarity numeric(5,4) DEFAULT 0,
          added_at timestamptz DEFAULT now(),
          CONSTRAINT product_cluster_members_unique UNIQUE (cluster_id, product_id)
        );
      `,
    },
    {
      name: 'creator_product_matches',
      sql: `
        CREATE TABLE IF NOT EXISTS creator_product_matches (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          influencer_id uuid NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
          match_score numeric(5,2) DEFAULT 0,
          niche_alignment numeric(5,2) DEFAULT 0,
          engagement_fit numeric(5,2) DEFAULT 0,
          price_range_fit numeric(5,2) DEFAULT 0,
          estimated_views bigint DEFAULT 0,
          estimated_conversions integer DEFAULT 0,
          estimated_profit numeric(10,2) DEFAULT 0,
          status text DEFAULT 'suggested',
          matched_at timestamptz DEFAULT now(),
          created_at timestamptz DEFAULT now(),
          CONSTRAINT creator_product_matches_unique UNIQUE (product_id, influencer_id)
        );
      `,
    },
    {
      name: 'ads',
      sql: `
        CREATE TABLE IF NOT EXISTS ads (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          external_id text NOT NULL,
          platform text NOT NULL,
          advertiser_name text,
          ad_text text,
          landing_url text,
          thumbnail_url text,
          impressions bigint DEFAULT 0,
          spend_estimate numeric(10,2) DEFAULT 0,
          days_running integer DEFAULT 0,
          is_scaling boolean DEFAULT false,
          discovery_query text,
          discovered_at timestamptz DEFAULT now(),
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          CONSTRAINT ads_external_platform_key UNIQUE (external_id, platform)
        );
      `,
    },
  ];

  // Execute each migration
  for (const migration of migrations) {
    try {
      const { error } = await admin.rpc('exec_sql', { sql: migration.sql });

      if (error) {
        // If exec_sql doesn't exist, try inserting a test row instead
        // to check if table already exists
        const { error: checkErr } = await admin
          .from(migration.name)
          .select('id')
          .limit(0);

        if (checkErr && checkErr.message.includes('not found')) {
          results.push({ table: migration.name, status: 'MISSING', error: 'Table does not exist and cannot be created via API. Run migration SQL manually.' });
        } else if (checkErr) {
          results.push({ table: migration.name, status: 'ERROR', error: checkErr.message });
        } else {
          results.push({ table: migration.name, status: 'EXISTS' });
        }
      } else {
        results.push({ table: migration.name, status: 'CREATED' });
      }
    } catch {
      // Fallback: just check if table exists
      const { error: checkErr } = await admin
        .from(migration.name)
        .select('id')
        .limit(0);

      if (checkErr && checkErr.message.includes('not found')) {
        results.push({ table: migration.name, status: 'MISSING', error: 'Run migration SQL in Supabase SQL Editor' });
      } else if (checkErr) {
        results.push({ table: migration.name, status: 'ERROR', error: checkErr.message });
      } else {
        results.push({ table: migration.name, status: 'EXISTS' });
      }
    }
  }

  const missing = results.filter(r => r.status === 'MISSING');
  const existing = results.filter(r => r.status === 'EXISTS' || r.status === 'CREATED');

  return NextResponse.json({
    status: missing.length === 0 ? 'all_tables_ready' : 'tables_missing',
    existing: existing.length,
    missing: missing.length,
    results,
    ...(missing.length > 0 ? {
      action_required: 'Run the SQL from supabase/migrations/016_missing_tables_consolidated.sql in the Supabase SQL Editor',
    } : {}),
  });
}
