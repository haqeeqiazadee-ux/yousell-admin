import type { ProductResult, ProviderConfig } from '../types';

const API_TOKEN = process.env.PRODUCTHUNT_API_TOKEN;

export function getProductHuntConfig(): ProviderConfig {
  return { name: 'producthunt-api', isConfigured: !!API_TOKEN };
}

export async function searchProductHuntProducts(query: string): Promise<ProductResult[]> {
  if (!API_TOKEN) return [];

  try {
    // Product Hunt GraphQL API
    const res = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        query: `{
          posts(order: VOTES, topic: "${query.replace(/"/g, '')}", first: 20) {
            edges {
              node {
                id
                name
                tagline
                url
                votesCount
                commentsCount
                thumbnail { url }
                createdAt
                topics { edges { node { name } } }
              }
            }
          }
        }`,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return [];
    const data = await res.json() as Record<string, unknown>;
    const posts = ((data.data as Record<string, unknown>)?.posts as Record<string, unknown>)?.edges as Array<Record<string, unknown>> || [];

    return posts.map((edge, i) => {
      const node = edge.node as Record<string, unknown>;
      return {
        id: `ph_${(node.id as string) || i}`,
        title: `${node.name}: ${node.tagline}`,
        price: 0,
        currency: 'USD',
        imageUrl: ((node.thumbnail as Record<string, unknown>)?.url as string) || undefined,
        url: (node.url as string) || 'https://producthunt.com',
        platform: 'digital' as const,
        metadata: {
          source: 'producthunt',
          votes: node.votesCount,
          comments: node.commentsCount,
          createdAt: node.createdAt,
        },
      };
    });
  } catch (err) {
    console.error('[ProductHunt Provider] Error:', err);
    return [];
  }
}
