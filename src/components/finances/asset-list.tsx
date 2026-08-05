'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Landmark, Briefcase } from 'lucide-react';
import { getDataForRegion } from '@/lib/data';
import type { Asset } from '@/lib/types';
import { useRegion } from '@/contexts/region-context';

const assetIcons: { [key: string]: React.ElementType } = {
  'Bank Account': Landmark,
  Portfolio: Briefcase,
  Other: Wallet,
};

function AssetRow({ asset }: { asset: Asset }) {
  const { locale } = useRegion();
  const Icon = assetIcons[asset.type] || Wallet;
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div className="font-medium">{asset.name}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">{asset.type}</div>
      </TableCell>
      <TableCell className="text-right font-medium">
        {new Intl.NumberFormat(locale, { style: 'currency', currency: asset.currency }).format(asset.balance)}
      </TableCell>
    </TableRow>
  );
}

export function AssetList() {
  const { region, locale, currency } = useRegion();
  const { assets } = getDataForRegion(region);

  const totalAssets = assets.reduce((sum, asset) => sum + asset.balance, 0);
  const formattedTotalAssets = new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(totalAssets);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vermögenswerte</CardTitle>
        <CardDescription>
          Eine Übersicht Ihrer aktuellen Konten und Anlagen. Gesamt: <span className="font-bold text-foreground">{formattedTotalAssets}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead className="text-right">Kontostand</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <AssetRow key={asset.id} asset={asset} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
