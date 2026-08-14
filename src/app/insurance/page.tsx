'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InsurancePage() {
  return (
    <RequireAuth>
      <MainLayout title="Versicherung">
        <Card>
          <CardHeader>
            <CardTitle>Versicherung</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Diese Seite befindet sich im Aufbau. Hier können Sie bald Ihre Versicherungen überblicken.</p>
          </CardContent>
        </Card>
      </MainLayout>
    </RequireAuth>
  );
}
