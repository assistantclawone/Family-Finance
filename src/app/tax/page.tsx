'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from "@/components/layout/main-layout";
import { TaxPreparation } from "@/components/finances/tax-preparation";

export default function TaxPage() {
  return (
    <RequireAuth>
      <MainLayout title="Steuererklärung">
        <TaxPreparation />
      </MainLayout>
    </RequireAuth>
  );
}
