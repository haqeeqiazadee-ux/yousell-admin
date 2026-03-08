export type Platform =
  | "tiktok"
  | "amazon"
  | "shopify"
  | "pinterest"
  | "digital"
  | "ai_affiliate"
  | "physical_affiliate";

export interface MockProduct {
  id: string;
  name: string;
  platform: Platform;
  category: string;
  price: number;
  score: number;
  trend_score: number;
  competition_level: "low" | "medium" | "high";
  estimated_monthly_revenue: number;
  url: string;
  image_url: string;
  description: string;
  tags: string[];
  discovered_at: string;
}

const TIKTOK_PRODUCTS = [
  { name: "LED Sunset Projection Lamp", category: "Home Decor", tags: ["viral", "lighting", "aesthetic"] },
  { name: "Cloud Shaped Humidifier", category: "Home & Garden", tags: ["trending", "humidifier", "cute"] },
  { name: "Magnetic Phone Mount for Car", category: "Accessories", tags: ["car", "phone", "magsafe"] },
  { name: "Portable Blender USB Rechargeable", category: "Kitchen", tags: ["health", "smoothie", "portable"] },
  { name: "Star Projector Night Light", category: "Home Decor", tags: ["bedroom", "galaxy", "ambiance"] },
  { name: "Acupressure Mat and Pillow Set", category: "Health & Wellness", tags: ["pain relief", "relaxation", "self-care"] },
  { name: "Mini Waffle Maker", category: "Kitchen Appliances", tags: ["breakfast", "compact", "gift"] },
  { name: "Reusable Ice Cube Stones", category: "Kitchen", tags: ["drinks", "eco-friendly", "whiskey"] },
];

const AMAZON_PRODUCTS = [
  { name: "Ergonomic Laptop Stand Adjustable", category: "Office", tags: ["WFH", "posture", "aluminum"] },
  { name: "Smart Water Bottle with Temperature Display", category: "Fitness", tags: ["hydration", "LED", "insulated"] },
  { name: "Collapsible Silicone Food Containers Set", category: "Kitchen", tags: ["meal prep", "space-saving", "BPA-free"] },
  { name: "Wireless Earbuds with Active Noise Cancellation", category: "Electronics", tags: ["audio", "ANC", "bluetooth"] },
  { name: "UV Phone Sanitizer Box", category: "Electronics", tags: ["hygiene", "UV-C", "wireless charging"] },
  { name: "Bamboo Desk Organizer with Charging Station", category: "Office", tags: ["organization", "sustainable", "USB"] },
  { name: "Electric Milk Frother Handheld", category: "Kitchen", tags: ["coffee", "latte", "battery-powered"] },
  { name: "Resistance Bands Set with Door Anchor", category: "Fitness", tags: ["workout", "home gym", "portable"] },
];

const SHOPIFY_PRODUCTS = [
  { name: "Personalized Pet Portrait Canvas", category: "Custom Gifts", tags: ["pets", "art", "personalized"] },
  { name: "Minimalist Leather Wallet RFID Blocking", category: "Accessories", tags: ["slim", "RFID", "genuine leather"] },
  { name: "Organic Cotton Baby Swaddle Blankets", category: "Baby", tags: ["organic", "newborn", "breathable"] },
  { name: "Custom Name Necklace Gold Plated", category: "Jewelry", tags: ["personalized", "gift", "14k"] },
  { name: "Handmade Soy Candle Gift Set", category: "Home", tags: ["aromatherapy", "eco-friendly", "gift set"] },
  { name: "Yoga Mat with Alignment Lines", category: "Fitness", tags: ["non-slip", "eco-friendly", "thick"] },
];

const PINTEREST_PRODUCTS = [
  { name: "Macrame Wall Hanging Kit DIY", category: "Crafts", tags: ["DIY", "boho", "handmade"] },
  { name: "Aesthetic Room Decor LED Neon Sign", category: "Home Decor", tags: ["neon", "wall art", "Instagram"] },
  { name: "Dried Flower Bouquet Arrangement", category: "Home Decor", tags: ["flowers", "minimalist", "natural"] },
  { name: "Ceramic Vase Set Modern Minimalist", category: "Home Decor", tags: ["Scandinavian", "pottery", "display"] },
  { name: "Woven Storage Baskets Set of 3", category: "Organization", tags: ["basket", "natural", "farmhouse"] },
  { name: "Terrazzo Coaster Set Handmade", category: "Home", tags: ["terrazzo", "coasters", "aesthetic"] },
];

const DIGITAL_PRODUCTS = [
  { name: "Notion Business Dashboard Template", category: "Templates", tags: ["Notion", "productivity", "SaaS"] },
  { name: "Instagram Reels Content Calendar", category: "Social Media", tags: ["content plan", "Canva", "marketing"] },
  { name: "Budget Planner Spreadsheet Google Sheets", category: "Finance", tags: ["budgeting", "spreadsheet", "personal finance"] },
  { name: "UI Kit for Mobile App Design Figma", category: "Design", tags: ["Figma", "UI/UX", "components"] },
  { name: "Wedding Planning Checklist Printable", category: "Printables", tags: ["wedding", "planner", "PDF"] },
  { name: "Stock Photo Bundle Lifestyle Collection", category: "Photography", tags: ["stock photos", "lifestyle", "commercial"] },
];

const AI_AFFILIATE_PRODUCTS = [
  { name: "Jasper AI - AI Writing Assistant", category: "AI Tools", tags: ["copywriting", "AI", "marketing"] },
  { name: "Midjourney Pro Subscription", category: "AI Art", tags: ["image generation", "AI art", "design"] },
  { name: "Synthesia - AI Video Platform", category: "AI Video", tags: ["video", "avatars", "AI presenter"] },
  { name: "Copy.ai - AI Marketing Platform", category: "AI Tools", tags: ["marketing copy", "automation", "AI"] },
  { name: "Descript - AI Video Editor", category: "AI Tools", tags: ["video editing", "transcription", "podcast"] },
  { name: "Pictory - AI Video Creator", category: "AI Video", tags: ["video", "blog to video", "automated"] },
];

const PHYSICAL_AFFILIATE_PRODUCTS = [
  { name: "Standing Desk Converter Adjustable", category: "Office", tags: ["ergonomic", "height adjustable", "monitor riser"] },
  { name: "Air Purifier with HEPA Filter", category: "Home", tags: ["clean air", "allergy", "quiet"] },
  { name: "Robot Vacuum with Mapping Technology", category: "Home", tags: ["smart home", "automated", "cleaning"] },
  { name: "Espresso Machine Semi-Automatic", category: "Kitchen", tags: ["coffee", "barista", "stainless steel"] },
  { name: "Noise Cancelling Headphones Over-Ear", category: "Electronics", tags: ["audio", "ANC", "wireless"] },
  { name: "Smart Fitness Watch with GPS", category: "Fitness", tags: ["health tracking", "GPS", "heart rate"] },
];

const PLATFORM_PRODUCTS: Record<Platform, Array<{ name: string; category: string; tags: string[] }>> = {
  tiktok: TIKTOK_PRODUCTS,
  amazon: AMAZON_PRODUCTS,
  shopify: SHOPIFY_PRODUCTS,
  pinterest: PINTEREST_PRODUCTS,
  digital: DIGITAL_PRODUCTS,
  ai_affiliate: AI_AFFILIATE_PRODUCTS,
  physical_affiliate: PHYSICAL_AFFILIATE_PRODUCTS,
};

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
  return `prod_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCompetitionLevel(): "low" | "medium" | "high" {
  const r = Math.random();
  if (r < 0.3) return "low";
  if (r < 0.7) return "medium";
  return "high";
}

export function generateMockProduct(platform: Platform): MockProduct {
  const template = pickRandom(PLATFORM_PRODUCTS[platform]);
  const score = randomInt(40, 99);
  const trendScore = randomInt(30, 100);
  const competition = generateCompetitionLevel();

  const priceRanges: Record<Platform, [number, number]> = {
    tiktok: [8.99, 49.99],
    amazon: [12.99, 199.99],
    shopify: [14.99, 89.99],
    pinterest: [9.99, 69.99],
    digital: [4.99, 97.00],
    ai_affiliate: [12.00, 99.00],
    physical_affiliate: [29.99, 599.99],
  };

  const [minPrice, maxPrice] = priceRanges[platform];
  const price = randomBetween(minPrice, maxPrice);

  const revenueMultiplier: Record<Platform, number> = {
    tiktok: 3500,
    amazon: 5000,
    shopify: 2800,
    pinterest: 2200,
    digital: 4000,
    ai_affiliate: 1800,
    physical_affiliate: 3000,
  };

  const estimatedRevenue = Math.round(
    (score / 100) * revenueMultiplier[platform] * (Math.random() * 0.5 + 0.75)
  );

  return {
    id: generateId(),
    name: template.name,
    platform,
    category: template.category,
    price,
    score,
    trend_score: trendScore,
    competition_level: competition,
    estimated_monthly_revenue: estimatedRevenue,
    url: `https://example.com/${platform}/${template.name.toLowerCase().replace(/\s+/g, "-")}`,
    image_url: `https://picsum.photos/seed/${Math.random().toString(36).slice(2, 8)}/400/400`,
    description: `Trending ${template.category.toLowerCase()} product discovered on ${platform}. ${template.tags.map((t) => `#${t}`).join(" ")}`,
    tags: template.tags,
    discovered_at: new Date().toISOString(),
  };
}

export function generateMockProducts(
  platform: Platform,
  count: number
): MockProduct[] {
  const products: MockProduct[] = [];
  for (let i = 0; i < count; i++) {
    products.push(generateMockProduct(platform));
  }
  return products;
}

export function generateScanResults(
  scanMode: "quick" | "full" | "client",
  clientId?: string
): { products: MockProduct[]; summary: Record<string, number> } {
  const platformCounts: Record<string, Record<Platform, number>> = {
    quick: {
      tiktok: 5,
      amazon: 0,
      shopify: 0,
      pinterest: 0,
      digital: 0,
      ai_affiliate: 0,
      physical_affiliate: 0,
    },
    full: {
      tiktok: 5,
      amazon: 5,
      shopify: 4,
      pinterest: 4,
      digital: 3,
      ai_affiliate: 3,
      physical_affiliate: 3,
    },
    client: {
      tiktok: 3,
      amazon: 3,
      shopify: 2,
      pinterest: 2,
      digital: 2,
      ai_affiliate: 2,
      physical_affiliate: 2,
    },
  };

  const counts = platformCounts[scanMode];
  const allProducts: MockProduct[] = [];

  for (const [platform, count] of Object.entries(counts)) {
    if (count > 0) {
      allProducts.push(...generateMockProducts(platform as Platform, count));
    }
  }

  const summary: Record<string, number> = {};
  for (const product of allProducts) {
    summary[product.platform] = (summary[product.platform] || 0) + 1;
  }

  return { products: allProducts, summary };
}
