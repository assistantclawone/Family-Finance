'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import { useRegion } from '@/contexts/region-context';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchAssets, fetchTransactions } from '@/lib/supabase/data';
import type { Asset, Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function Overview() {
  const { locale, currency } = useRegion();
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
        console.error('Fehler beim Laden der Daten:', e);
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

  const totalAssets = assets.reduce((sum, asset) => sum + asset.balance, 0);
  const monthlyIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSavings = monthlyIncome - monthlyExpenses;
  // Überschlägige Projektion über 3 Monate anhand des geschätzten Netto-Sparbetrags
  const forecast3Months = totalAssets + Math.max(netSavings, 0) * 3;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(value);
  }
  
  const overviewCards = [
    { title: 'Gesamtvermögen', value: formatCurrency(totalAssets), icon: Wallet, change: 'Ist-Bestand' },
    { title: 'Prognose (3 Monate)', value: formatCurrency(forecast3Months), icon: TrendingUp, change: 'überschlägig' },
    { title: 'Monatseinkommen', value: formatCurrency(monthlyIncome), icon: DollarSign, change: 'Ist-Daten' },
    { title: 'Monatsausgaben', value: `~ ${formatCurrency(monthlyExpenses)}`, icon: TrendingDown, change: 'variabel' },
  ];

  if (isUserLoading || isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28" />
              <Skeleton className="mt-2 h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
