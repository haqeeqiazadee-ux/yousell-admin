import { supabaseAdmin } from '../supabase';

const CACHE_TTL_HOURS = 24;

export async function getCachedProducts(source: string, _query: string): Promise<Record<string, unknown>[] | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('platform', source)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data;
}

export async function getCachedTrends(_query: string): Promise<Record<string, unknown>[] | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('trend_keywords')
    .select('*')
    .gte('fetched_at', cutoff)
    .order('fetched_at', { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data;
}
