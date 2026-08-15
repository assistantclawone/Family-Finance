'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from "@/components/layout/main-layout";
import { BudgetOverview } from "@/components/finances/budget-overview";
import { SavingsGoals } from "@/components/finances/savings-goals";

export default function BudgetPage() {
  return (
    <RequireAuth>
      <MainLayout title="Budget & Sparziele">
        <div className="space-y-6">
          <BudgetOverview />
          <SavingsGoals />
        </div>
      </MainLayout>
    </RequireAuth>
  );
}
