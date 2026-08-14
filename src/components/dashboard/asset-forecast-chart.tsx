'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useRegion } from '@/contexts/region-context';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchAssets, fetchTransactions } from '@/lib/supabase/data';
import type { Asset, Transaction, ForecastDataPoint } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const chartConfig = {
  value: {
    label: 'Vermögen',
    color: 'hsl(var(--primary))',
  },
  income: {
    label: 'Einkommen',
    color: 'hsl(var(--chart-2))',
  },
  expenses: {
    label: 'Ausgaben',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;

const MONTH_ABBR = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export function AssetForecastChart() {
  const { currency, locale } = useRegion();
  const { user, isUserLoading } = useUser();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user || !isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [a, t] = await Promise.all([fetchAssets(), fetchTransactions()]);
        if (!mounted) return;
        setAssets(a);
        setTransactions(t);
      } catch (e) {
        console.error('Fehler beim Laden der Prognose-Daten:', e);
        if (mounted) {
          setAssets([]);
          setTransactions([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  if (isUserLoading || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vermögensprognose</CardTitle>
          <CardDescription>Prognostizierte Entwicklung Ihres Gesamtvermögens.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user || !isSupabaseConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vermögensprognose</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Anmeldung erforderlich</AlertTitle>
            <AlertDescription>Melden Sie sich an, um die Prognose zu sehen.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalAssets = assets.reduce((sum, asset) => sum + asset.balance, 0);
  const monthlyIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netMonthly = Math.max(monthlyIncome - monthlyExpenses, 0);

  // Überschlägige Projektion über die nächsten 6 Monate auf Basis des Ist-Bestands
  const now = new Date();
  const forecastData: ForecastDataPoint[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
    return {
      date: MONTH_ABBR[d.getMonth()],
      value: totalAssets + netMonthly * (i + 1),
      income: monthlyIncome,
      expenses: monthlyExpenses,
    };
  });

  const formatYAxis = (value: number) => {
    if (currency === 'CHF') {
       return `${Number(value) / 1000}k CHF`;
    }
    return `€${Number(value) / 1000}k`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vermögensprognose</CardTitle>
        <CardDescription>Prognostizierte Entwicklung Ihres Gesamtvermögens über die nächsten 6 Monate.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <AreaChart
              data={forecastData}
              margin={{
                top: 5,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
              />
              <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => 
                 new Intl.NumberFormat(locale, { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(Number(value))
              } />} />
              <Area
                dataKey="value"
                type="natural"
                fill="url(#fillValue)"
                stroke="hsl(var(--primary))"
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
