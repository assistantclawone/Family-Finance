import { MainLayout } from "@/components/layout/main-layout";
import { AssetList } from "@/components/finances/asset-list";
import { UpcomingExpenses } from "@/components/dashboard/upcoming-expenses";

export default function FinancesPage() {
  return (
    <MainLayout title="Finanzen">
        <div className="space-y-6">
            <AssetList />
            <UpcomingExpenses />
        </div>
    </MainLayout>
  );
}
