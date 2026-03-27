"use client"

import { useState } from "react"
import {
  FileText, Plus, Download, Share2, RefreshCw, Sparkles,
  Search, ChevronRight, ChevronLeft, Loader2, Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { StreamingText } from "@/components/StreamingText"

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */

const MOCK_BLUEPRINTS = [
  {
    id: "bp-1",
    title: "LED Strip Lights — TikTok Shop Launch",
    generatedAt: "2026-03-25",
    bullets: [
      "Sourcing: Alibaba verified supplier, MOQ 500, $2.10/unit",
      "Platform: TikTok Shop + Amazon FBA",
      "Creators: 12 micro-influencers identified (10k-80k followers)",
      "Ads: Spark Ads budget $500/wk, projected 3.2x ROAS",
      "Pricing: RRP $19.99, margin 68% after fees",
      "Financial: Break-even at 320 units, 30-day payback",
      "Risk: Medium — 4 competitors, strong differentiation via RGB modes",
    ],
  },
  {
    id: "bp-2",
    title: "Portable Blender — Multi-Platform Strategy",
    generatedAt: "2026-03-18",
    bullets: [
      "Sourcing: 1688.com, MOQ 200, $6.80/unit landed",
      "Platform: Shopify DTC + Amazon UK",
      "Creators: 8 fitness/wellness creators shortlisted",
      "Ads: Meta Advantage+ $300/wk, TikTok TopView $200/wk",
      "Pricing: RRP $34.99, margin 54% after shipping",
      "Financial: Break-even at 180 units, 45-day payback",
      "Risk: Low — trending category, limited UK competition",
    ],
  },
  {
    id: "bp-3",
    title: "Pet Grooming Glove — Budget Launch",
    generatedAt: "2026-03-10",
    bullets: [
      "Sourcing: DHgate, MOQ 100, $1.40/unit",
      "Platform: TikTok Shop only",
      "Creators: 5 pet niche creators, gifting strategy",
      "Ads: Organic-first, $150/wk Spark Ads after traction",
      "Pricing: RRP $12.99, margin 72%",
      "Financial: Break-even at 95 units, 14-day payback",
      "Risk: Low — evergreen product, high repeat purchase rate",
    ],
  },
]

const RECENT_PRODUCTS = [
  { id: "p-1", title: "LED Strip Lights RGB 10m" },
  { id: "p-2", title: "Portable Blender 600ml" },
  { id: "p-3", title: "Pet Grooming Glove" },
  { id: "p-4", title: "Magnetic Phone Mount" },
  { id: "p-5", title: "Aroma Diffuser 300ml" },
]

const BLUEPRINT_SECTIONS = [
  "1. Executive Summary",
  "2. Product & Sourcing Analysis",
  "3. Platform Strategy",
  "4. Creator & Influencer Plan",
  "5. Advertising Strategy",
  "6. Pricing & Margin Breakdown",
  "7. Financial Projections",
  "8. Competitive Landscape",
  "9. Risk Assessment",
  "10. Launch Timeline (90 days)",
  "11. KPIs & Success Metrics",
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function BlueprintsPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [step, setStep] = useState(1)

  // Step 1 state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")

  // Step 2 state
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({
    tiktok: true,
    amazon: false,
    shopify: false,
    ebay: false,
  })
  const [budget, setBudget] = useState("")
  const [timeline, setTimeline] = useState("")
  const [experience, setExperience] = useState("")

  // Step 3/4
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const filteredProducts = RECENT_PRODUCTS.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleStartGenerate() {
    setStep(3)
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
      setStep(4)
    }, 4000)
  }

  function resetWizard() {
    setShowWizard(false)
    setStep(1)
    setSearchQuery("")
    setSelectedProduct("")
    setPlatforms({ tiktok: true, amazon: false, shopify: false, ebay: false })
    setBudget("")
    setTimeline("")
    setExperience("")
    setGenerating(false)
    setGenerated(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-brand-400" />
            My Launch Blueprints
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            3 blueprints generated this month
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Generate New Blueprint
        </Button>
      </div>

      {/* ---- Generation Wizard ---- */}
      {showWizard && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-400" />
              New Launch Blueprint
            </CardTitle>
            <CardDescription>
              Step {step} of 4
              {step <= 2 && " — Configure your blueprint parameters"}
              {step === 3 && " — Generating your blueprint"}
              {step === 4 && " — Preview your blueprint"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Step 1 — Select Product */}
            {step === 1 && (
              <div className="space-y-4">
                <Label>Search for a product</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Recent products
                  </p>
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedProduct === p.id
                          ? "bg-brand-400/10 text-brand-400 font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    disabled={!selectedProduct}
                    onClick={() => setStep(2)}
                    className="gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 — Configure */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(platforms).map(([key, checked]) => (
                      <label key={key} className="flex items-center gap-2 text-sm capitalize">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setPlatforms((prev) => ({ ...prev, [key]: v }))
                          }
                        />
                        {key === "tiktok" ? "TikTok Shop" : key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Budget range</Label>
                    <Select value={budget} onValueChange={setBudget} placeholder="Select budget">
                      <SelectOption value="low">Under $500/month</SelectOption>
                      <SelectOption value="mid">$500 - $2,000/month</SelectOption>
                      <SelectOption value="high">$2,000 - $5,000/month</SelectOption>
                      <SelectOption value="premium">$5,000+/month</SelectOption>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Launch timeline</Label>
                    <Select value={timeline} onValueChange={setTimeline} placeholder="Select timeline">
                      <SelectOption value="fast">2 weeks (fast)</SelectOption>
                      <SelectOption value="standard">30 days (standard)</SelectOption>
                      <SelectOption value="thorough">60 days (thorough)</SelectOption>
                      <SelectOption value="extended">90 days (extended)</SelectOption>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Experience level</Label>
                    <Select value={experience} onValueChange={setExperience} placeholder="Select level">
                      <SelectOption value="beginner">Beginner</SelectOption>
                      <SelectOption value="intermediate">Intermediate</SelectOption>
                      <SelectOption value="advanced">Advanced</SelectOption>
                      <SelectOption value="agency">Agency / Pro</SelectOption>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={handleStartGenerate} className="gap-1.5">
                    <Sparkles className="h-4 w-4" /> Generate Blueprint
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 — Generating */}
            {step === 3 && generating && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
                <StreamingText
                  text="Generating your launch blueprint... Analysing product data, sourcing options, competitor landscape, and building your personalised strategy."
                  speed={40}
                  showCopy={false}
                  className="text-center max-w-md"
                />
                <p className="text-xs text-muted-foreground">
                  This usually takes 15-30 seconds
                </p>
              </div>
            )}

            {/* Step 4 — Preview */}
            {step === 4 && generated && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="font-medium text-emerald-600">Blueprint generated successfully</span>
                </div>

                <div className="rounded-lg border p-4 space-y-3 max-h-80 overflow-y-auto">
                  {BLUEPRINT_SECTIONS.map((section) => (
                    <div key={section}>
                      <h4 className="font-semibold text-sm">{section}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Detailed analysis and recommendations will appear here based on your
                        selected product, platforms, budget, and experience level.
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetWizard}>
                    Close
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-1.5">
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                    <Button className="gap-1.5">
                      <Check className="h-4 w-4" /> Save Blueprint
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---- Saved Blueprint Cards ---- */}
      <div className="grid gap-4">
        {MOCK_BLUEPRINTS.map((bp) => (
          <Card key={bp.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{bp.title}</CardTitle>
                  <CardDescription>
                    Generated on {new Date(bp.generatedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </CardDescription>
                </div>
                <Badge variant="secondary">Saved</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 mb-4">
                {bp.bullets.map((b, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> View Full Blueprint
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  <Sparkles className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
