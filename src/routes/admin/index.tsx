import { createFileRoute } from "@tanstack/react-router";
import { WelcomeSection } from "@/components/admin/dashboard/WelcomeSection";
import { KpiCards } from "@/components/admin/dashboard/KpiCards";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { LiveOperationsGrid } from "@/components/admin/dashboard/LiveOperationsGrid";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";
import { AiBusinessInsights } from "@/components/admin/dashboard/AiBusinessInsights";
import { LiveFeedCard } from "@/components/admin/dashboard/LiveFeedCard";
import { LowStockAlert } from "@/components/admin/dashboard/LowStockAlert";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="w-full pb-10 space-y-6">
      {/* 1. Greeting + Store Status */}
      <WelcomeSection />
      
      {/* 2. KPI Cards */}
      <KpiCards />

      {/* 3. Middle: Revenue Chart (left) & Live Operations Grid (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <LiveOperationsGrid />
        </div>
      </div>
      
      {/* 4. Below: Recent Orders (left) & (AI Insights + Live Feed) (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RecentOrdersTable />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AiBusinessInsights />
          <LiveFeedCard />
        </div>
      </div>

      {/* 5. Bottom: Low Stock & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlert />
        <RecentActivityFeed />
      </div>
    </div>
  );
}
