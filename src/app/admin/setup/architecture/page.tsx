"use client";

/**
 * Section 33.5 — Architecture Reference Page (read-only).
 * Displays AI orchestration stack and V9 3-Section Platform Architecture.
 */

const aiStack = [
  { tool: "LangChain", role: "LLM chaining", whereUsed: "Blueprint gen" },
  { tool: "LangGraph", role: "Multi-agent orchestration", whereUsed: "25-engine coordination" },
  { tool: "CrewAI", role: "Role-based workflows", whereUsed: "Discovery pipeline" },
  { tool: "Claude Haiku", role: "Fast inference", whereUsed: "74% of calls" },
  { tool: "Claude Sonnet", role: "Deep reasoning", whereUsed: "26% of calls" },
  { tool: "pgvector", role: "Vector search", whereUsed: "Product search" },
  { tool: "Supabase Realtime", role: "Live updates", whereUsed: "Health monitor" },
  { tool: "BullMQ + Redis", role: "Job queue", whereUsed: "All workers" },
];

const tiktokEngines = [
  "TikTok Discovery",
  "Creator Matching",
  "Content Creation",
  "Ad Intelligence",
  "Trend Detection",
];

const amazonEngines = [
  "Amazon Intelligence",
  "Competitor Intelligence",
  "Profitability Engine",
  "Fulfillment Recommendation",
  "Supplier Discovery",
];

const shopifyEngines = [
  "Shopify Intelligence",
  "Store Integration",
  "POD Engine",
  "Order Tracking",
  "Affiliate Commission",
];

const crossPlatformEngines = [
  "Discovery Engine",
  "Scoring Engine",
  "Financial Modelling",
  "Clustering Engine",
  "Opportunity Feed",
  "Launch Blueprint",
  "Smart Schedule",
  "Client Allocation",
  "Automation Orchestrator",
  "Admin Command Center",
];

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Architecture Reference</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only overview of the YOUSELL V9 platform architecture and AI orchestration stack.
        </p>
      </div>

      {/* AI Orchestration Stack */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">AI Orchestration Stack</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Tool</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Where Used</th>
              </tr>
            </thead>
            <tbody>
              {aiStack.map((row) => (
                <tr key={row.tool} className="border-b last:border-b-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{row.tool}</td>
                  <td className="px-4 py-2.5">{row.role}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.whereUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* V9 3-Section Platform Architecture (Section 33.6) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">V9 3-Section Platform Architecture</h2>
        <p className="text-sm text-muted-foreground">
          The platform is organized into three marketplace sections, each with dedicated engines,
          plus a set of cross-platform engines shared across all sections.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {/* TikTok Section */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-brand-400)]">
              TikTok Section
            </h3>
            <ul className="space-y-1.5">
              {tiktokEngines.map((engine) => (
                <li key={engine} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                  {engine}
                </li>
              ))}
            </ul>
          </div>

          {/* Amazon Section */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold text-orange-500">Amazon Section</h3>
            <ul className="space-y-1.5">
              {amazonEngines.map((engine) => (
                <li key={engine} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  {engine}
                </li>
              ))}
            </ul>
          </div>

          {/* Shopify Section */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold text-green-500">Shopify Section</h3>
            <ul className="space-y-1.5">
              {shopifyEngines.map((engine) => (
                <li key={engine} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {engine}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Cross-Platform Engines */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Cross-Platform Engines</h2>
        <p className="text-sm text-muted-foreground">
          Shared engines that operate across all three marketplace sections.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {crossPlatformEngines.map((engine) => (
            <div
              key={engine}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {engine}
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground">
        This page is read-only and for informational reference. Architecture changes are managed
        through the codebase.
      </p>
    </div>
  );
}
