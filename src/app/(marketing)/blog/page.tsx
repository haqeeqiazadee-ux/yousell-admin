'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type BlogCategory = 'All' | 'Product Updates' | 'Guides' | 'Case Studies' | 'Industry';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: BlogCategory;
  readTime: string;
  featured: boolean;
}

const posts: BlogPost[] = [
  {
    slug: 'introducing-external-engines',
    title: 'Introducing External Engines: Connect Any Data Source to yousell',
    excerpt:
      'We just shipped one of our most requested features — External Engines. Now you can pipe data from any third-party API directly into your yousell dashboard.',
    date: 'Mar 27, 2026',
    category: 'Product Updates',
    readTime: '4 min',
    featured: true,
  },
  {
    slug: 'tiktok-shop-trends-q1-2026',
    title: 'TikTok Shop Trends Q1 2026: What Sold and Why',
    excerpt:
      'We analysed 2.4 million TikTok Shop products to find the biggest movers in Q1. Here are the categories, price points, and creators driving sales.',
    date: 'Mar 22, 2026',
    category: 'Industry',
    readTime: '7 min',
    featured: false,
  },
  {
    slug: 'how-to-find-winning-products',
    title: 'How to Find Winning Products in 2026: The Complete Guide',
    excerpt:
      'A step-by-step playbook for discovering high-margin, low-competition products using AI-powered trend detection.',
    date: 'Mar 18, 2026',
    category: 'Guides',
    readTime: '12 min',
    featured: false,
  },
  {
    slug: 'case-study-scaling-to-100k',
    title: 'From $0 to $100K/mo: How One Seller Used yousell to Scale',
    excerpt:
      'Meet Jordan, a solo dropshipper who went from zero to six figures in 8 months using yousell\'s product discovery and ad intelligence engines.',
    date: 'Mar 14, 2026',
    category: 'Case Studies',
    readTime: '6 min',
    featured: false,
  },
  {
    slug: 'amazon-bsr-explained',
    title: 'Amazon BSR Explained: What It Means and How to Track It',
    excerpt:
      'Best Seller Rank is one of the most misunderstood metrics on Amazon. We break down what it actually measures and how to use it for product research.',
    date: 'Mar 10, 2026',
    category: 'Guides',
    readTime: '5 min',
    featured: false,
  },
  {
    slug: 'ai-content-generation-update',
    title: 'New: AI Content Generation for Product Listings',
    excerpt:
      'yousell Creative Studio now generates SEO-optimised product titles, descriptions, and bullet points across Amazon, Shopify, and TikTok Shop.',
    date: 'Mar 5, 2026',
    category: 'Product Updates',
    readTime: '3 min',
    featured: false,
  },
  {
    slug: 'supplier-negotiation-tips',
    title: '7 Supplier Negotiation Tips Backed by Data',
    excerpt:
      'We analysed 10,000 supplier quotes in our database to find the tactics that consistently lead to better pricing and terms.',
    date: 'Feb 28, 2026',
    category: 'Industry',
    readTime: '8 min',
    featured: false,
  },
];

const categories: BlogCategory[] = ['All', 'Product Updates', 'Guides', 'Case Studies', 'Industry'];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory>('All');

  const featuredPost = posts.find((p) => p.featured)!;
  const filteredPosts = posts
    .filter((p) => !p.featured)
    .filter((p) => activeCategory === 'All' || p.category === activeCategory);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-rose-50 to-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Blog
          </h1>
          <p className="mt-3 text-lg text-gray-600">Latest from YouSell</p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="mx-auto max-w-7xl px-6 -mt-4">
        <Link href={`/blog/${featuredPost.slug}`} className="group block">
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow lg:flex">
            <div className="lg:w-1/2 bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center p-12">
              <div className="text-6xl font-bold text-rose-300 select-none">YS</div>
            </div>
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <span className="inline-block w-fit rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                {featuredPost.category}
              </span>
              <h2 className="mt-4 text-2xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">{featuredPost.excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <span>{featuredPost.date}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {featuredPost.readTime}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Category Filter */}
      <section className="mx-auto max-w-7xl px-6 mt-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="h-full rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {/* Thumbnail placeholder */}
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-200 select-none">YS</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="inline-block w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600">
                    {post.category}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
