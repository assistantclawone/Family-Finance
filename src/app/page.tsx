'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { Overview } from '@/components/dashboard/overview';
import { AssetForecastChart } from '@/components/dashboard/asset-forecast-chart';
import { UpcomingExpenses } from '@/components/dashboard/upcoming-expenses';
import { AiInsights } from '@/components/dashboard/ai-insights';

export default function DashboardPage() {
  return (
    <RequireAuth>
      <MainLayout title="Dashboard">
        <div className="space-y-6">
          <Overview />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <AssetForecastChart />
            </div>
            <div className="lg:col-span-3">
              <AiInsights />
            </div>
          </div>
          <UpcomingExpenses />
        </div>
      </MainLayout>
    </RequireAuth>
  );
}
