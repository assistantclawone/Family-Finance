'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import { getDataForRegion } from '@/lib/data';
import { useRegion } from '@/contexts/region-context';
import { useMemo } from 'react';

export function Overview() {
  const { region, locale, currency } = useRegion();
  
  const data = useMemo(() => {
    const { assets, forecastData, recurringExpenses } = getDataForRegion(region);
    
    const totalAssets = assets.reduce((sum, asset) => sum + asset.balance, 0);
    const monthlyIncome = 6000; // Assuming static for now
    const monthlyExpenses = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const forecast3Months = forecastData[2]?.value || 0; // 3rd month from now

    return {
      totalAssets,
      monthlyIncome,
      monthlyExpenses,
      forecast3Months
    };
  }, [region]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(value);
  }
  
  const overviewCards = [
    { title: 'Gesamtvermögen', value: formatCurrency(data.totalAssets), icon: Wallet, change: '+2.5% vs. Vormonat' },
    { title: 'Prognose (3 Monate)', value: formatCurrency(data.forecast3Months), icon: TrendingUp, change: '+5.1% erwartet' },
    { title: 'Monatseinkommen', value: formatCurrency(data.monthlyIncome), icon: DollarSign, change: 'fix' },
    { title: 'Monatsausgaben', value: `~ ${formatCurrency(data.monthlyExpenses)}`, icon: TrendingDown, change: 'variabel' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {overviewCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
