'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchBudgetLimits, addBudgetLimit, deleteBudgetLimit, fetchTransactions } from '@/lib/supabase/data';
import type { BudgetLimit, CurrencyCode, Transaction } from '@/lib/types';
import { convertCurrency, formatCurrencyAmount, REFERENCE_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/currency';

const CATEGORIES = [
  'Wohnen', 'Lebensmittel', 'Transport', 'Versicherung', 'Gesundheit',
  'Bildung', 'Freizeit', 'Kleidung', 'Essen gehen', 'Sonstiges',
];

const CHART_COLORS = ['hsl(var(--primary))', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#64748b'];

export function BudgetOverview() {
  const { user } = useUser();
  const { toast } = useToast();
  const [limits, setLimits] = useState<BudgetLimit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newLimit, setNewLimit] = useState('');
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>(REFERENCE_CURRENCY);
  const [isAdding, setIsAdding] = useState(false);
  const isConfigured = isSupabaseConfigured;

  const locale = 'de-CH';

  async function load() {
    if (!user || !isConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [ls, tx] = await Promise.all([fetchBudgetLimits(), fetchTransactions()]);
      setLimits(ls);
      setTransactions(tx);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Budgetdaten konnten nicht geladen werden.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Tatsächliche Ausgaben pro Kategorie (laufender Monat)
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const spendingByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense' && t.date && String(t.date).startsWith(monthStr))
    .forEach((t) => {
      const cat = (t.category || 'Sonstiges') as string;
      spendingByCategory[cat] = (spendingByCategory[cat] || 0) + convertCurrency(Number(t.amount), t.currency || REFERENCE_CURRENCY, REFERENCE_CURRENCY);
    });

  const rows = limits.map((l) => {
    const spent = spendingByCategory[l.category] || 0;
    const limitRef = convertCurrency(l.monthlyLimit, l.currency, REFERENCE_CURRENCY);
    const pct = limitRef > 0 ? Math.min(100, Math.round((spent / limitRef) * 100)) : 0;
    const over = spent > limitRef;
    return { limit: l, spent, limitRef, pct, over };
  });

  const totalLimitRef = rows.reduce((s, r) => s + r.limitRef, 0);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);

  const pieData = Object.entries(spendingByCategory).map(([name, value]) => ({ name, value }));

  async function handleAdd() {
    if (!newCategory || isNaN(Number(newLimit)) || Number(newLimit) <= 0) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte Kategorie und gültiges Limit angeben.' });
      return;
    }
    setIsAdding(true);
    try {
      await addBudgetLimit({ category: newCategory, monthlyLimit: Number(newLimit), currency: newCurrency });
      setNewLimit('');
      toast({ title: 'Budgetgrenze gesetzt!', description: `Limit für "${newCategory}" wurde angelegt.` });
      await load();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Budgetgrenze konnte nicht gespeichert werden.' });
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBudgetLimit(id);
      setLimits((prev) => prev.filter((l) => l.id !== id));
      toast({ title: 'Gelöscht', description: 'Budgetgrenze entfernt.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Budgetgrenze konnte nicht gelöscht werden.' });
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5" /> Budgetgrenzen</CardTitle>
            <CardDescription>Monatliche Ausgabenlimits pro Kategorie. Summe Limit: {formatCurrencyAmount(totalLimitRef, REFERENCE_CURRENCY, locale)} · Ausgegeben: {formatCurrencyAmount(totalSpent, REFERENCE_CURRENCY, locale)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Budgetgrenzen. Legen Sie die erste fest.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Ausgegeben</TableHead>
                    <TableHead className="w-[180px]">Verbrauch</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.limit.id}>
                      <TableCell className="font-medium">{r.limit.category}</TableCell>
                      <TableCell>{formatCurrencyAmount(r.limitRef, REFERENCE_CURRENCY, locale)}</TableCell>
                      <TableCell className={r.over ? 'font-semibold text-red-600' : ''}>{formatCurrencyAmount(r.spent, REFERENCE_CURRENCY, locale)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={r.pct} className={r.over ? '[&>div]:bg-red-600' : ''} />
                          <span className="text-xs text-muted-foreground w-8 text-right">{r.pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.limit.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="grid gap-2 sm:grid-cols-4">
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" step="0.01" min="0" placeholder="Monatslimit" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} />
              <Select value={newCurrency} onValueChange={(v) => setNewCurrency(v as CurrencyCode)}>
                <SelectTrigger><SelectValue placeholder="Währung" /></SelectTrigger>
                <SelectContent>{SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={handleAdd} disabled={isAdding}>
                <Plus className="mr-1 h-4 w-4" /> {isAdding ? 'Speichert...' : 'Limit setzen'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ausgaben nach Kategorie</CardTitle>
            <CardDescription>Aktueller Monat — alle erfassenden Ausgaben.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Ausgaben in diesem Monat erfasst.</p>
            ) : (
              <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={110} innerRadius={60} paddingAngle={2}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrencyAmount(Number(value), REFERENCE_CURRENCY, locale)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
