import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Clock, ArrowLeft, Calendar } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Post data (mirrors blog index — single source of truth)            */
/* ------------------------------------------------------------------ */

const posts = [
  {
    slug: 'introducing-external-engines',
    title: 'Introducing External Engines: Connect Any Data Source to yousell',
    excerpt:
      'We just shipped one of our most requested features — External Engines. Now you can pipe data from any third-party API directly into your yousell dashboard.',
    date: 'Mar 27, 2026',
    category: 'Product Updates',
    readTime: '4 min',
    content: `
We've been listening. Since launch, the number-one request from power users has been the ability to bring their own data into yousell — not just the platforms we support natively, but any source: custom scrapers, niche marketplaces, internal sales data, supplier feeds.

Today, External Engines is live for all Pro and Agency plan subscribers.

## What are External Engines?

External Engines are user-configurable data connectors. You provide an endpoint (REST API, webhook, or CSV upload), map the fields to yousell's schema, and the data flows into your dashboard in real time.

Once connected, your external data benefits from the same AI scoring, trend detection, and alerting infrastructure as our native engines.

## How to set one up

1. Navigate to **Admin → External Engines → Add Engine**
2. Give it a name and select your source type (REST API, Webhook, or CSV)
3. Paste your endpoint URL and authentication details
4. Map your fields to yousell's schema using our drag-and-drop mapper
5. Set your refresh interval (minimum 15 minutes on Pro, 5 minutes on Agency)
6. Hit **Activate** — data starts flowing immediately

## What you can connect

- Any REST API returning JSON
- Webhooks (we generate a unique inbound URL for you)
- CSV uploads (manual or via scheduled link)
- Shopify custom metafields
- Your own database via our read-only connector

## What's next

We're working on native connectors for Faire, Tundra, and Wayfair. These will be auto-configured — no field mapping needed. Expected Q2 2026.

External Engines are available now. Log in and head to your Engine settings to get started.
    `,
  },
  {
    slug: 'tiktok-shop-trends-q1-2026',
    title: 'TikTok Shop Trends Q1 2026: What Sold and Why',
    excerpt:
      'We analysed 2.4 million TikTok Shop products to find the biggest movers in Q1. Here are the categories, price points, and creators driving sales.',
    date: 'Mar 22, 2026',
    category: 'Industry',
    readTime: '7 min',
    content: `
Q1 2026 was a breakout quarter for TikTok Shop in the UK and EU. We processed 2.4 million product listings and 180 million engagement signals to understand what drove sales — and what didn't.

## The top-level numbers

- Average order value: £23.40 (up 12% from Q4 2025)
- Top category: Beauty & Personal Care (34% of GMV)
- Fastest-growing category: Home & Kitchen (up 89% YoY)
- Most competitive: Phone Accessories (margin compression of 40%)

## The winning categories

**Beauty dominated.** Specifically, skincare with "science-backed" positioning — products that name an active ingredient in the first 3 seconds of the video. The top 50 beauty products on TikTok Shop all used this format.

**Home & Kitchen was the surprise.** Products under £15 with a clear "problem-solution" demo video consistently outperformed. The LED sunrise alarm clock was the single highest-revenue product of Q1, selling 94,000 units in 8 weeks.

**Fitness stalled.** Post-January fitness fatigue hit hard. Resistance bands, yoga mats, and protein accessories all declined in March.

## Creator dynamics

Micro-creators (10K–100K followers) drove 61% of TikTok Shop GMV in Q1 — up from 47% in Q1 2025. The era of mega-influencer dominance is over for product sales.

The most effective creator partnerships were in the £15–£35 price band with 4–7 video posts over 2 weeks.

## Price point sweet spots

- Under £10: high volume, thin margins, high return rates
- £15–£35: optimal conversion and margin balance
- Over £50: requires strong brand trust; challenging for new products

## What this means for you

If you're sourcing for TikTok Shop right now, focus on Home & Kitchen, Beauty (with an ingredient story), and Pet Accessories (Q2 trending signal already strong). Avoid Phone Accessories unless you have a differentiated angle.

Our Trend Radar already has Q2 pre-viral signals for all these categories. Log in to see what's about to break.
    `,
  },
  {
    slug: 'how-to-find-winning-products',
    title: 'How to Find Winning Products in 2026: The Complete Guide',
    excerpt:
      'A step-by-step playbook for discovering high-margin, low-competition products using AI-powered trend detection.',
    date: 'Mar 18, 2026',
    category: 'Guides',
    readTime: '12 min',
    content: `
Finding winning products used to mean spending hours scrolling TikTok, manually checking Amazon BSR, and guessing which trends were real vs fleeting. That was 2023. In 2026, the process is fundamentally different if you use the right tools.

This is our complete playbook.

## Step 1: Start with the signal, not the product

Most sellers make the mistake of finding a product first, then looking for evidence it will sell. Flip this. Start with a strong signal — an unusual spike in search volume, a cluster of viral videos, a sudden BSR movement — and let the data guide you to the product.

In yousell, your Trend Radar does this automatically. Every morning it shows you the 50 highest-momentum signals across TikTok, Amazon, Google Shopping, Etsy, and 10 more platforms.

## Step 2: Score it on three dimensions

Not all trending products are worth sourcing. Before getting excited, score every candidate on:

1. **Margin potential** — Can you land it, market it, and sell it for 3x or more?
2. **Competition density** — How many sellers are already in the space?
3. **Trend window** — Is this pre-viral, peak-viral, or post-viral?

yousell's composite score (0–100) does this automatically, combining 8 data signals into a single number.

## Step 3: Validate with pre-viral detection

Our pre-viral model looks for products showing early signals before they hit mainstream awareness. Specifically, it looks for:

- Rapid engagement growth (views → saves ratio)
- Creator adoption acceleration
- Search volume vs supply gap
- BSR movement in the -1 to -30 day window

A score above 70 in our pre-viral model means the product hasn't peaked yet. That's your window.

## Step 4: Check the competition intelligence

Before sourcing, run a competitor analysis. How many Shopify stores are selling this product? What are they charging? Are they running paid ads?

In yousell, head to the product's Competitor Intel tab. It shows you live data on who's selling, their pricing, and estimated ad spend.

## Step 5: Validate your supplier

Once you've identified a product, validate your supply chain. Can you get it at a price point that leaves margin after ads and shipping? Are there multiple suppliers (reducing single-source risk)?

yousell's Supplier Intelligence module shows you live supplier quotes for thousands of products, directly from Alibaba, Ingram Micro, and 40+ other sources.

## Step 6: Build your launch brief

Don't launch blind. Before spending a penny on inventory, build a launch brief:

- Positioning angle (what makes your listing different)
- Content strategy (which creator types to target)
- Pricing strategy (where to price relative to competition)
- Target ROAS and break-even point

yousell's AI Briefing generates this for you in under 30 seconds.

## The full workflow in yousell

1. Trend Radar → find signals
2. Pre-Viral Score → confirm timing
3. Competitor Intel → assess competition
4. Supplier Intel → validate margins
5. AI Briefing → build launch plan

Done in under 10 minutes. That's the 2026 way.
    `,
  },
  {
    slug: 'case-study-scaling-to-100k',
    title: 'From $0 to $100K/mo: How One Seller Used yousell to Scale',
    excerpt:
      "Meet Jordan, a solo dropshipper who went from zero to six figures in 8 months using yousell's product discovery and ad intelligence engines.",
    date: 'Mar 14, 2026',
    category: 'Case Studies',
    readTime: '6 min',
    content: `
Jordan Malik started selling online with £800 and a Wi-Fi connection in a shared flat in Manchester. Eight months later, his store was doing over $100,000 in monthly revenue across TikTok Shop and Shopify. This is how he did it.

## The starting point

Before yousell, Jordan was spending 3–4 hours a day on product research. He'd manually scroll TikTok, check Amazon BSR, and try to spot trends before they peaked. His win rate was about 1 in 8 products.

"I'd find something, order samples, list it, and half the time by the time I was ready to sell it had already peaked. I was always one step behind."

## Finding the first winning product

Jordan signed up for yousell's Pro plan in July 2025. Within 48 hours, the Trend Radar flagged a portable UV-C sanitiser wand with a pre-viral score of 83. It had been trending in South Korea for 3 weeks but hadn't broken into UK or US markets yet.

Jordan verified the supplier cost, checked the competitor density (low — 4 active Shopify stores), and built a launch plan using the AI Briefing.

"The whole process took me 20 minutes. With my old process it would have been 3 days of research."

He ordered 200 units. Sold out in 11 days. Re-ordered 500.

## Scaling with ad intelligence

By month 3, Jordan was running TikTok ads. He used yousell's Ad Intelligence module to see what creatives were working for similar products — not just the ads themselves, but the hooks, formats, and creator demographics driving the most conversions.

"I basically reverse-engineered what was already working. I didn't have to test 20 ad angles. yousell told me the top 3."

His first campaign hit a 3.8x ROAS in week one.

## The system he built

By month 6, Jordan had a repeatable system:

1. Check Trend Radar every Monday morning
2. Run any promising products through the pre-viral model
3. Order samples for anything scoring above 75
4. Use AI Briefings to build launch plans
5. Mirror winning ad formats from Ad Intelligence

"I'm not guessing anymore. It's like having a data team. But it's just me and an app."

## The result

Month 8 revenue: $103,400. Net margin after ads and fulfilment: 28%. Current product portfolio: 7 active SKUs across TikTok Shop (UK, US) and Shopify.

Jordan is now on the Agency plan and building a small team. His next goal: $500K/mo by end of 2026.

---

*Want to build a similar system? [Start your free trial](/signup) — no credit card required.*
    `,
  },
  {
    slug: 'amazon-bsr-explained',
    title: 'Amazon BSR Explained: What It Means and How to Track It',
    excerpt:
      "Best Seller Rank is one of the most misunderstood metrics on Amazon. We break down what it actually measures and how to use it for product research.",
    date: 'Mar 10, 2026',
    category: 'Guides',
    readTime: '5 min',
    content: `
Amazon Best Seller Rank (BSR) is one of the most frequently cited metrics in product research — and one of the most misunderstood. Here's what it actually means and how to use it properly.

## What BSR actually measures

BSR is a relative ranking of a product within its Amazon category, based on sales velocity. A BSR of #1 means it's the best-selling product in that category. A BSR of #50,000 means there are 49,999 products in that category that sold more recently.

Key word: **recently**. BSR is not a cumulative lifetime metric. Amazon updates it hourly and it heavily weights recent sales over historical ones. A product can go from BSR #100,000 to BSR #500 overnight if it suddenly goes viral.

## What BSR doesn't tell you

BSR doesn't tell you:
- How many units sold (only relative rank)
- Revenue or profit
- Whether the trend is sustainable
- Competition density (two products can have similar BSRs with very different competitive landscapes)

## How to use BSR for product research

**Pattern 1: Sudden BSR improvement**
A product moving from #80,000 to #3,000 in 7 days is a strong signal. Someone or something is driving sales. This is worth investigating — is it organic, a TikTok video, a press mention?

**Pattern 2: Consistent low BSR**
A product with BSR under #1,000 in its category for 90+ days is proven. High competition but proven demand.

**Pattern 3: BSR volatility**
Consistent swings between #500 and #50,000 suggest seasonal or event-driven demand. Plan around it.

## Tracking BSR in yousell

yousell's Amazon Intelligence module tracks BSR history for millions of products. In the BSR Movers tab, you can filter for products that have shown the biggest positive BSR movement in the last 7, 14, or 30 days — a direct signal of emerging demand.

Set up a BSR alert for any product you're watching and get notified when it crosses a threshold you define.

Log in and head to **Dashboard → Amazon → BSR Movers** to see today's biggest movers.
    `,
  },
  {
    slug: 'ai-content-generation-update',
    title: 'New: AI Content Generation for Product Listings',
    excerpt:
      'yousell Creative Studio now generates SEO-optimised product titles, descriptions, and bullet points across Amazon, Shopify, and TikTok Shop.',
    date: 'Mar 5, 2026',
    category: 'Product Updates',
    readTime: '3 min',
    content: `
Writing product listings is one of the most time-consuming parts of running an ecommerce business. A well-optimised Amazon listing takes 45–90 minutes to write properly. Multiply that by 20 SKUs and you're losing days.

As of today, yousell Creative Studio generates them for you.

## What it generates

For each product, Creative Studio produces:

**Amazon:**
- SEO-optimised title (keyword-rich, within character limits)
- 5 bullet points (benefit-led, formatted for A9 algorithm)
- Product description with HTML formatting
- Backend keyword suggestions

**Shopify:**
- Product title
- Full description with SEO meta tags
- Collection tags
- Alt text for product images

**TikTok Shop:**
- Product name optimised for TikTok search
- Bullet points formatted for mobile
- Hashtag suggestions for organic discovery

## How it works

1. Open any product in your yousell dashboard
2. Click **Generate Listing** in the top right
3. Select your target platform(s)
4. Review and copy — or push directly to your connected store

The AI uses the product's trend data, category context, competitor listing analysis, and your own brand voice settings (configurable in Account Settings → AI Preferences).

## Quality and accuracy

We ran a 30-day A/B test on 200 products. Listings generated by Creative Studio outperformed manually-written listings on click-through rate by 18% on Amazon and 24% on Shopify.

## Available now

Creative Studio is live for all Pro and Agency plan subscribers. Access it from any product page in your dashboard.
    `,
  },
  {
    slug: 'supplier-negotiation-tips',
    title: '7 Supplier Negotiation Tips Backed by Data',
    excerpt:
      'We analysed 10,000 supplier quotes in our database to find the tactics that consistently lead to better pricing and terms.',
    date: 'Feb 28, 2026',
    category: 'Industry',
    readTime: '8 min',
    content: `
We have 10,000+ supplier quotes in our database across Alibaba, Ingram Micro, and 40+ other sources. We analysed them to find what consistently leads to better pricing. Here are the 7 tactics that work.

## 1. Order at the 3x MOQ sweet spot

Suppliers offer their best per-unit pricing at 3x their stated minimum order quantity (MOQ). Ordering exactly at MOQ signals you're testing and uncommitted. Ordering at 3x MOQ signals you're serious. We saw an average 23% price reduction at this threshold.

## 2. Reference competitor pricing in your opening message

Suppliers expect negotiation. Referencing a competing supplier's price (even approximately) in your opening message shifts the conversation to a known anchor. Our data shows this reduces time-to-deal by 40% on average.

## 3. Ask for "sample pricing" on your first bulk order

Many suppliers will give you sample-tier per-unit pricing on your first bulk order if you frame it as a relationship builder: "We're evaluating multiple suppliers and this initial order will determine our long-term partner." This worked in 34% of cases we tracked.

## 4. Specify payment terms upfront

Suppliers price risk into quotes. Offering 30% deposit + 70% on delivery signals reliability. Offering 50% upfront often unlocks 5–10% better pricing because it removes their financing cost.

## 5. Bundle accessory products

If you're buying a main product, asking to add 2–3 complementary accessories to the same order (even small quantities) often triggers better per-unit pricing on the main product. Suppliers prefer consolidated logistics.

## 6. Ask for exclusivity on colourways, not SKUs

Full SKU exclusivity is expensive. But colour exclusivity is cheap for most suppliers and gives you meaningful differentiation. "Can we be exclusive on the matte black version for UK/EU?" is a common successful request.

## 7. Negotiate warranty terms over price

When you've hit a price floor, shift to warranty and return terms. An extended warranty (12 months vs 6 months) is worth more to your customer conversion rate than a £0.50 per unit price reduction — and costs the supplier almost nothing.

---

yousell's Supplier Intelligence module shows you current market rates for thousands of products, so you always enter negotiations with real data. [Start free trial →](/signup)
    `,
  },
];

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const paragraphs = post.content
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-rose-50 to-white py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
          </Link>

          <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 mb-4">
            {post.category}
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-tight">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {post.readTime} read
            </span>
          </div>
        </div>
      </section>

      {/* Thumbnail */}
      <div className="mx-auto max-w-3xl px-6 -mt-2 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 h-52 flex items-center justify-center">
          <span className="text-6xl font-bold text-rose-300 select-none">YS</span>
        </div>
      </div>

      {/* Body */}
      <article className="mx-auto max-w-3xl px-6 pb-24 prose prose-gray prose-lg">
        {paragraphs.map((line, i) => {
          if (line.startsWith('## ')) {
            return (
              <h2 key={i} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={i} className="font-semibold text-gray-900 mt-4 mb-1">
                {line.replace(/\*\*/g, '')}
              </p>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li key={i} className="text-gray-700 ml-4 list-disc">
                {line.replace('- ', '')}
              </li>
            );
          }
          if (line.startsWith('1. ') || line.match(/^\d+\./)) {
            return (
              <li key={i} className="text-gray-700 ml-4 list-decimal">
                {line.replace(/^\d+\.\s/, '')}
              </li>
            );
          }
          if (line === '---') {
            return <hr key={i} className="my-8 border-gray-200" />;
          }
          return (
            <p key={i} className="text-gray-700 leading-relaxed mt-4">
              {line}
            </p>
          );
        })}
      </article>

      {/* CTA */}
      <section className="bg-rose-50 border-t border-rose-100 py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Start discovering winning products today
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            No credit card · 5 min setup · Cancel anytime
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="/signup"
              className="bg-rose-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-rose-700 transition text-sm"
            >
              Start Free Trial
            </a>
            <Link
              href="/blog"
              className="text-gray-600 font-medium text-sm hover:text-rose-600 transition"
            >
              ← More articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
