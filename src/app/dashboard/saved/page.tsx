"use client"

import { useState } from "react"
import {
  Search,
  Clock,
  Play,
  Pencil,
  Trash2,
  Filter,
  Bookmark,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/* ---------- Mock Data ---------- */

const savedSearches = [
  {
    id: "1",
    query: "Trending Notion templates under $50",
    filters: ["Platform: Gumroad", "Category: Templates", "Price: <$50"],
    resultsCount: 47,
    lastRun: "2026-03-27T09:30:00Z",
    status: "active" as const,
  },
  {
    id: "2",
    query: "AI writing tools with 25%+ commission",
    filters: ["Network: PartnerStack", "Commission: >25%", "Category: Content Writing"],
    resultsCount: 12,
    lastRun: "2026-03-26T14:15:00Z",
    status: "active" as const,
  },
  {
    id: "3",
    query: "Top-rated kitchen products on Amazon",
    filters: ["Network: Amazon Associates", "Category: Kitchen", "Rating: 4.5+"],
    resultsCount: 83,
    lastRun: "2026-03-25T11:00:00Z",
    status: "active" as const,
  },
  {
    id: "4",
    query: "Fitness products with high EPC",
    filters: ["Category: Health & Fitness", "EPC: >$1.50", "Score: >80"],
    resultsCount: 19,
    lastRun: "2026-03-24T08:45:00Z",
    status: "paused" as const,
  },
  {
    id: "5",
    query: "Udemy courses growing 10%+ weekly",
    filters: ["Platform: Udemy", "Growth 7d: >10%", "Reviews: >1000"],
    resultsCount: 31,
    lastRun: "2026-03-23T16:20:00Z",
    status: "active" as const,
  },
  {
    id: "6",
    query: "SaaS tools with 90-day cookie window",
    filters: ["Cookie: 90 days", "Category: SaaS", "Network: All"],
    resultsCount: 8,
    lastRun: "2026-03-22T10:10:00Z",
    status: "paused" as const,
  },
]

/* ---------- Helpers ---------- */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/* ---------- Page ---------- */

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState(savedSearches)

  const handleDelete = (id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id))
  }

  const activeCount = searches.filter((s) => s.status === "active").length
  const pausedCount = searches.filter((s) => s.status === "paused").length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Saved Searches{" "}
            <span className="text-base font-normal text-muted-foreground">
              [{searches.length} searches saved]
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your saved product searches and run them again anytime.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{activeCount} active</Badge>
          <Badge variant="outline">{pausedCount} paused</Badge>
        </div>
      </div>

      {/* Search Cards */}
      <div className="space-y-4">
        {searches.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {item.query}
                    </h3>
                    <Badge
                      variant={item.status === "active" ? "default" : "outline"}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.filters.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                      >
                        <Filter className="h-3 w-3" />
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      {item.resultsCount} results
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last run: {formatDate(item.lastRun)}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm">
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Run again
                  </Button>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {searches.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No saved searches yet. Run a product search and save it for quick access.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
