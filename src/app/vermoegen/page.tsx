'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from "@/components/layout/main-layout";
import { AssetList } from "@/components/finances/asset-list";
import { PortfolioList } from "@/components/finances/portfolio-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VermoegenPage() {
  return (
    <RequireAuth>
      <MainLayout title="Vermögen">
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="assets">Vermögenswerte</TabsTrigger>
            <TabsTrigger value="portfolios">Portfolios & Depots</TabsTrigger>
          </TabsList>
          <TabsContent value="assets">
            <AssetList />
          </TabsContent>
          <TabsContent value="portfolios">
            <PortfolioList />
          </TabsContent>
        </Tabs>
      </MainLayout>
    </RequireAuth>
  );
}
