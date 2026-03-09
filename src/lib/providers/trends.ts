import { getCachedTrends } from './cache';

export interface TrendResult {
  keyword: string;
  volume: number;
  trend_direction: 'rising' | 'stable' | 'declining';
  trend_score: number;
  related_keywords: string[];
  source: string;
}

/**
 * Fetch trend data from configured provider
 * Uses env var TRENDS_PROVIDER or GOOGLE_TRENDS_PROVIDER
 * Batches keywords in groups of 5 per cost rules
 */
export async function fetchTrends(keywords: string[]): Promise<TrendResult[]> {
  const provider = process.env.TRENDS_PROVIDER || process.env.GOOGLE_TRENDS_PROVIDER || 'pytrends';

  // Check 24h cache first
  const cacheKey = keywords.sort().join(',');
  const cached = await getCachedTrends(cacheKey);
  if (cached) return cached as unknown as TrendResult[];

  // Batch keywords in groups of 5 (cost rule)
  const batches: string[][] = [];
  for (let i = 0; i < keywords.length; i += 5) {
    batches.push(keywords.slice(i, i + 5));
  }

  const results: TrendResult[] = [];

  for (const batch of batches) {
    switch (provider) {
      case 'pytrends':
        results.push(...await fetchFromPytrends(batch));
        break;
      case 'serpapi':
        results.push(...await fetchFromSerpApi(batch));
        break;
      default:
        console.warn(`Unknown trends provider: ${provider}`);
    }
  }

  return results;
}

/**
 * Free API priority order per cost rules:
 * pytrends > Reddit > TikTok Creative Center > PA-API > YouTube > Product Hunt > Meta Ads > SerpAPI > Apify > RapidAPI
 */
async function fetchFromPytrends(keywords: string[]): Promise<TrendResult[]> {
  // pytrends is a Python library — in a Node.js environment,
  // this would call a backend endpoint or use Google Trends API directly
  // Placeholder — actual integration needed via Railway backend
  return keywords.map(keyword => ({
    keyword,
    volume: 0,
    trend_direction: 'stable' as const,
    trend_score: 0,
    related_keywords: [],
    source: 'pytrends',
  }));
}

async function fetchFromSerpApi(keywords: string[]): Promise<TrendResult[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.warn('SERPAPI_KEY not set');
    return [];
  }
  // Placeholder — actual SerpAPI integration needed
  return [];
}
