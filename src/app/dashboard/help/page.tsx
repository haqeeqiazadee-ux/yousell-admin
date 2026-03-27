"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Circle,
  BookOpen,
  Code2,
  HeadphonesIcon,
  Lightbulb,
  Compass,
  MessageSquare,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

/* ---------- Checklist Data ---------- */

const checklistItems = [
  { id: "1", label: "Connect your first platform", done: true },
  { id: "2", label: "Run your first product scan", done: true },
  { id: "3", label: "Add a product to your watchlist", done: false },
  { id: "4", label: "Generate your first blueprint", done: false },
  { id: "5", label: "Set up product alerts", done: false },
]

/* ---------- Quick Links Data ---------- */

const quickLinks = [
  {
    title: "Documentation",
    description: "Comprehensive guides for all YOUSELL features.",
    icon: BookOpen,
    href: "#",
  },
  {
    title: "API Reference",
    description: "Integrate YOUSELL data into your own tools.",
    icon: Code2,
    href: "#",
  },
  {
    title: "Contact Support",
    description: "Get help from our team within 24 hours.",
    icon: HeadphonesIcon,
    href: "#",
  },
  {
    title: "Feature Requests",
    description: "Vote on upcoming features or suggest new ones.",
    icon: Lightbulb,
    href: "#",
  },
]

/* ---------- FAQ Data ---------- */

const faqItems = [
  {
    value: "faq-1",
    question: "How do I connect a new platform?",
    answer:
      "Navigate to Settings > Integrations and click 'Add Platform'. Select the platform you want to connect (Amazon, Shopify, Etsy, etc.), then follow the OAuth or API key prompts. Once connected, your product data will begin syncing automatically within a few minutes.",
  },
  {
    value: "faq-2",
    question: "What does the product score mean?",
    answer:
      "The product score is a proprietary metric (0-100) that combines estimated monthly sales, review velocity, growth trend, competition level, and profit margin potential. A score above 90 indicates a high-opportunity product, 80-89 is solid, and below 80 may require niche targeting.",
  },
  {
    value: "faq-3",
    question: "How often is product data refreshed?",
    answer:
      "Product data is refreshed every 6 hours for actively tracked products and every 24 hours for watchlist items. You can trigger an on-demand refresh from any product detail page by clicking the 'Refresh' button. Real-time alerts are processed within 15 minutes of data changes.",
  },
  {
    value: "faq-4",
    question: "Can I export my data?",
    answer:
      "Yes. Every table in the dashboard has an 'Export CSV' button in the top-right corner. You can also use the API to programmatically pull data. Pro plan users have access to scheduled exports that automatically deliver CSV or JSON files to email or webhook endpoints.",
  },
  {
    value: "faq-5",
    question: "How do blueprints work?",
    answer:
      "Blueprints are AI-generated product launch plans based on market data. Once you select a product, click 'Generate Blueprint' to receive a step-by-step plan including supplier recommendations, pricing strategy, listing optimization tips, and estimated timelines. Blueprints update as market conditions change.",
  },
]

/* ---------- Page ---------- */

export default function HelpOnboardingPage() {
  const completedCount = checklistItems.filter((i) => i.done).length

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Help &amp; Onboarding
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get started with YOUSELL and find answers to common questions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Compass className="h-4 w-4 mr-1.5" />
            Start Dashboard Tour
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Contact Support
          </Button>
        </div>
      </div>

      {/* Getting Started Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Getting Started</CardTitle>
            <Badge variant="secondary">
              {completedCount}/{checklistItems.length} completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    item.done
                      ? "text-muted-foreground line-through"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {item.label}
                </span>
                {item.done && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Done
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round((completedCount / checklistItems.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / checklistItems.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Card key={link.title} className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <link.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {link.title}
                      </h3>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {link.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single">
            {faqItems.map((faq) => (
              <AccordionItem key={faq.value} value={faq.value}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
