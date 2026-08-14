'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from "@/components/layout/main-layout";
import { AppointmentList } from "@/components/health/appointment-list";
import { InsurancePolicies } from "@/components/health/insurance-policies";
import { EmergencyContacts } from "@/components/health/emergency-contacts";

export default function HealthPage() {
  return (
    <RequireAuth>
      <MainLayout title="Gesundheit">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
              <AppointmentList />
              <InsurancePolicies />
          </div>
          <EmergencyContacts />
        </div>
      </MainLayout>
    </RequireAuth>
  );
}
