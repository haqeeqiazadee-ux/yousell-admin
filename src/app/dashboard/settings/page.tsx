"use client"

import { useState } from "react"
import {
  Settings, User, Bell, Link2, Brain, Key,
  Copy, Check, ExternalLink, Pencil,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

/* ------------------------------------------------------------------ */
/*  Profile Tab                                                       */
/* ------------------------------------------------------------------ */

function ProfileTab() {
  const [editing, setEditing] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </CardTitle>
          <Button
            size="sm"
            variant={editing ? "default" : "outline"}
            onClick={() => setEditing(!editing)}
            className="gap-1.5"
          >
            {editing ? (
              <>
                <Check className="h-3.5 w-3.5" /> Save
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            {editing ? (
              <Input defaultValue="Muhammad Usman" />
            ) : (
              <p className="text-sm text-muted-foreground px-2.5 py-1.5 border rounded-lg bg-muted/30">
                Muhammad Usman
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            {editing ? (
              <Input defaultValue="usman@yousell.co" type="email" />
            ) : (
              <p className="text-sm text-muted-foreground px-2.5 py-1.5 border rounded-lg bg-muted/30">
                usman@yousell.co
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            {editing ? (
              <Select defaultValue="europe-london">
                <SelectOption value="europe-london">Europe/London (GMT+0)</SelectOption>
                <SelectOption value="america-new_york">America/New_York (EST)</SelectOption>
                <SelectOption value="america-los_angeles">America/Los_Angeles (PST)</SelectOption>
                <SelectOption value="asia-dubai">Asia/Dubai (GST)</SelectOption>
                <SelectOption value="asia-tokyo">Asia/Tokyo (JST)</SelectOption>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground px-2.5 py-1.5 border rounded-lg bg-muted/30">
                Europe/London (GMT+0)
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Language</Label>
            {editing ? (
              <Select defaultValue="en">
                <SelectOption value="en">English</SelectOption>
                <SelectOption value="ar">Arabic</SelectOption>
                <SelectOption value="fr">French</SelectOption>
                <SelectOption value="de">German</SelectOption>
                <SelectOption value="es">Spanish</SelectOption>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground px-2.5 py-1.5 border rounded-lg bg-muted/30">
                English
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Notifications Tab                                                 */
/* ------------------------------------------------------------------ */

function NotificationsTab() {
  const [frequency, setFrequency] = useState("daily")
  const [toggles, setToggles] = useState({
    scoreChanges: true,
    priceAlerts: true,
    viralSignals: true,
    competitorAlerts: false,
    weeklyDigest: true,
    productUpdates: false,
  })

  function setToggle(key: keyof typeof toggles, val: boolean) {
    setToggles((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Frequency */}
        <div className="space-y-2">
          <Label>Email frequency</Label>
          <div className="flex flex-wrap gap-3">
            {(["instant", "daily", "weekly", "off"] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="freq"
                  value={opt}
                  checked={frequency === opt}
                  onChange={() => setFrequency(opt)}
                  className="accent-brand-400"
                />
                <span className="capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Alert type toggles */}
        <div className="space-y-3">
          <Label>Alert types</Label>
          {([
            ["scoreChanges",    "Score changes"],
            ["priceAlerts",     "Price alerts"],
            ["viralSignals",    "Pre-viral signals"],
            ["competitorAlerts","Competitor alerts"],
            ["weeklyDigest",    "Weekly digest email"],
            ["productUpdates",  "Product updates"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-sm">{label}</span>
              <Switch
                checked={toggles[key]}
                onCheckedChange={(v) => setToggle(key, v)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Connected Platforms Tab                                            */
/* ------------------------------------------------------------------ */

interface PlatformCardProps {
  name: string
  connected: boolean
  icon: string
}

function PlatformCard({ name, connected, icon }: PlatformCardProps) {
  const [isConnected, setIsConnected] = useState(connected)

  return (
    <Card>
      <CardContent className="pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-medium text-sm">{name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {isConnected ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  Connected
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-gray-400 inline-block" />
                  Not connected
                </>
              )}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={isConnected ? "outline" : "default"}
          onClick={() => setIsConnected(!isConnected)}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </Button>
      </CardContent>
    </Card>
  )
}

function ConnectedPlatformsTab() {
  return (
    <div className="space-y-3">
      <PlatformCard name="Shopify" connected={true} icon={"\uD83D\uDED2"} />
      <PlatformCard name="Amazon" connected={true} icon={"\uD83D\uDCE6"} />
      <PlatformCard name="TikTok Shop" connected={false} icon={"\uD83C\uDFB5"} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AI Preferences Tab                                                */
/* ------------------------------------------------------------------ */

function AIPreferencesTab() {
  const [categories, setCategories] = useState<string[]>(["Electronics", "Beauty", "Home"])
  const [markets, setMarkets] = useState({ uk: true, usa: true, europe: false })
  const [excludeCats, setExcludeCats] = useState({ food: false, supplements: true, tobacco: true })
  const [tone, setTone] = useState("professional")

  const allCategories = [
    "Electronics", "Beauty", "Home", "Fashion", "Sports", "Toys", "Pet", "Kitchen",
  ]

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-4 w-4" /> AI Preferences
        </CardTitle>
        <CardDescription>
          Customize how YOUSELL AI generates recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category chips */}
        <div className="space-y-2">
          <Label>Preferred categories</Label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  categories.includes(cat)
                    ? "bg-brand-400 text-white border-brand-400"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Target markets */}
        <div className="space-y-2">
          <Label>Target markets</Label>
          <div className="flex flex-wrap gap-4">
            {([
              ["uk", "UK"],
              ["usa", "USA"],
              ["europe", "Europe"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={markets[key]}
                  onCheckedChange={(v) =>
                    setMarkets((prev) => ({ ...prev, [key]: v }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Exclude categories */}
        <div className="space-y-2">
          <Label>Exclude categories</Label>
          <div className="flex flex-wrap gap-4">
            {([
              ["food", "Food & Beverage"],
              ["supplements", "Supplements"],
              ["tobacco", "Tobacco / Vaping"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={excludeCats[key]}
                  onCheckedChange={(v) =>
                    setExcludeCats((prev) => ({ ...prev, [key]: v }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* AI Tone */}
        <div className="space-y-1.5">
          <Label>AI tone</Label>
          <Select value={tone} onValueChange={setTone} className="w-56">
            <SelectOption value="professional">Professional</SelectOption>
            <SelectOption value="casual">Casual</SelectOption>
            <SelectOption value="technical">Technical</SelectOption>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  API Tab                                                           */
/* ------------------------------------------------------------------ */

function APITab() {
  const [copied, setCopied] = useState(false)
  const maskedKey = "sk_live_****************************a3f7"

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(maskedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-4 w-4" /> API Access
        </CardTitle>
        <CardDescription>
          Use the YOUSELL API to integrate product intelligence into your own tools.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* API Key */}
        <div className="space-y-1.5">
          <Label>API key</Label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={maskedKey}
              className="font-mono text-xs flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 shrink-0">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Docs link */}
        <div>
          <Button variant="link" className="gap-1 px-0 text-sm">
            View API documentation <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Rate limits */}
        <div className="space-y-2">
          <Label>Rate limits</Label>
          <div className="rounded-lg border p-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Requests per minute</span>
              <span className="font-medium">60</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Requests per day</span>
              <span className="font-medium">10,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Concurrent connections</span>
              <span className="font-medium">5</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-brand-400" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, notifications, and preferences.
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="platforms" className="gap-1.5">
            <Link2 className="h-3.5 w-3.5" /> Connected Platforms
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" /> AI Preferences
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5">
            <Key className="h-3.5 w-3.5" /> API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="platforms">
          <ConnectedPlatformsTab />
        </TabsContent>
        <TabsContent value="ai">
          <AIPreferencesTab />
        </TabsContent>
        <TabsContent value="api">
          <APITab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
