export { scrapeTikTokProducts, searchTrends } from './tiktok';
export type { TikTokProduct } from './tiktok';

export { scrapeAmazonProducts } from './amazon';
export type { AmazonProduct } from './amazon';

export { scrapeShopifyProducts } from './shopify';
export type { ShopifyProduct } from './shopify';

export { scrapePinterestProducts } from './pinterest';
export type { PinterestProduct } from './pinterest';

export type Product = {
  external_id: string;
  title: string;
  price: number;
  url: string;
  image_url: string;
  sales_count: number;
  review_count: number;
  rating: number;
  source: string;
  viral_score?: number;
};
