import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Performance insights and trend analysis
        </p>
      </div>

      <div className="rounded-xl border bg-white p-12 text-center">
        <BarChart2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700">Coming Soon</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Product performance dashboards, trend velocity charts, revenue
          tracking, and client allocation analytics are currently in
          development.
        </p>
      </div>
    </div>
  );
}
