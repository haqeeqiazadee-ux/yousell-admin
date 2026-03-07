import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  TrendingUp,
  Swords,
  Music2,
  ShoppingCart,
} from "lucide-react";

const stats = [
  {
    title: "Products Tracked",
    value: "0",
    description: "No products yet",
    icon: Package,
  },
  {
    title: "Active Trends",
    value: "0",
    description: "Run Trend Scout to discover",
    icon: TrendingUp,
  },
  {
    title: "Competitors",
    value: "0",
    description: "Add competitors to track",
    icon: Swords,
  },
  {
    title: "TikTok Products",
    value: "0",
    description: "Connect TikTok to start",
    icon: Music2,
  },
  {
    title: "Amazon Listings",
    value: "0",
    description: "Connect Amazon to start",
    icon: ShoppingCart,
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            YouSell Admin Intelligence Platform
          </p>
        </div>
        <Badge variant="outline" className="text-green-500 border-green-500/30">
          System Online
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Complete the Setup Wizard in Settings to configure your API keys and start discovering products.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Supabase</span>
              <Badge variant="outline" className="text-green-500 border-green-500/30">Connected</Badge>
            </div>
            <div className="flex justify-between">
              <span>Railway API</span>
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">Not Configured</Badge>
            </div>
            <div className="flex justify-between">
              <span>AI Engine</span>
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">Not Configured</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
