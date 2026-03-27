import type { ProductResult, ProviderConfig } from '../types';

const API_KEY = process.env.YOUTUBE_API_KEY;

export function getYouTubeConfig(): ProviderConfig {
  return { name: 'youtube-data-api', isConfigured: !!API_KEY };
}

export async function searchYouTubeProducts(query: string): Promise<ProductResult[]> {
  if (!API_KEY) return [];

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: `${query} product review`,
      type: 'video',
      videoDuration: 'short',
      order: 'viewCount',
      maxResults: '25',
      key: API_KEY,
    });

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return [];
    const data = await res.json() as Record<string, unknown>;
    const items = (data.items || []) as Array<Record<string, unknown>>;

    return items.map((item, i) => {
      const snippet = item.snippet as Record<string, unknown>;
      const id = item.id as Record<string, unknown>;
      return {
        id: `yt_${(id?.videoId as string) || i}`,
        title: (snippet?.title as string) || '',
        price: 0,
        currency: 'USD',
        imageUrl: ((snippet?.thumbnails as Record<string, unknown>)?.high as Record<string, unknown>)?.url as string,
        url: `https://youtube.com/watch?v=${id?.videoId}`,
        platform: 'tiktok' as const,
        metadata: {
          source: 'youtube',
          channelTitle: snippet?.channelTitle,
          publishedAt: snippet?.publishedAt,
          description: ((snippet?.description as string) || '').slice(0, 200),
        },
      };
    });
  } catch (err) {
    console.error('[YouTube Provider] Error:', err);
    return [];
  }
}
