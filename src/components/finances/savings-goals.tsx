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
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchSavingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from '@/lib/supabase/data';
import type { SavingsGoal, CurrencyCode } from '@/lib/types';
import { formatCurrencyAmount, REFERENCE_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/currency';

export function SavingsGoals() {
  const { user } = useUser();
  const { toast } = useToast();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newSaved, setNewSaved] = useState('');
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>(REFERENCE_CURRENCY);
  const [newDeadline, setNewDeadline] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [contributions, setContributions] = useState<Record<string, string>>({});
  const isConfigured = isSupabaseConfigured;

  const locale = 'de-CH';

  async function load() {
    if (!user || !isConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      setGoals(await fetchSavingsGoals());
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Sparziele konnten nicht geladen werden.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleAdd() {
    const name = newName.trim();
    const target = Number(newTarget);
    const saved = Number(newSaved) || 0;
    if (!name || isNaN(target) || target <= 0) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte Name und Zielbetrag angeben.' });
      return;
    }
    setIsAdding(true);
    try {
      await addSavingsGoal({
        name,
        targetAmount: target,
        savedAmount: saved,
        currency: newCurrency,
        deadline: newDeadline ? new Date(newDeadline).toISOString() : null,
      });
      setNewName(''); setNewTarget(''); setNewSaved(''); setNewDeadline(''); setNewCurrency(REFERENCE_CURRENCY);
      toast({ title: 'Sparziel angelegt!', description: 'Ihr neues Sparziel wurde gespeichert.' });
      await load();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Sparziel konnte nicht gespeichert werden.' });
    } finally {
      setIsAdding(false);
    }
  }

  async function handleContribute(goal: SavingsGoal) {
    const amount = Number(contributions[goal.id]);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte einen gültigen Betrag angeben.' });
      return;
    }
    try {
      await updateSavingsGoal(goal.id, { savedAmount: goal.savedAmount + amount });
      setContributions((c) => ({ ...c, [goal.id]: '' }));
      toast({ title: 'Beitrag gespeichert!', description: 'Der Sparbetrag wurde hinzugefügt.' });
      await load();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Beitrag konnte nicht gespeichert werden.' });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSavingsGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast({ title: 'Gelöscht', description: 'Sparziel entfernt.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Sparziel konnte nicht gelöscht werden.' });
    }
  }

  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Sparziele</CardTitle>
        <CardDescription>
          Sparen Sie aktiv auf konkrete Ziele. Gesamtfortschritt: {formatCurrencyAmount(totalSaved, REFERENCE_CURRENCY, locale)} von {formatCurrencyAmount(totalTarget, REFERENCE_CURRENCY, locale)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
        ) : goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Sparziele. Legen Sie Ihr erstes Ziel an.</p>
        ) : (
          goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100)) : 0;
            const done = g.savedAmount >= g.targetAmount;
            return (
              <div key={g.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{g.name} {done && <span className="ml-1 text-xs font-semibold text-emerald-600">✓ erreicht</span>}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrencyAmount(g.savedAmount, g.currency, locale)} von {formatCurrencyAmount(g.targetAmount, g.currency, locale)}
                      {g.deadline ? ` · Ziel bis ${new Date(g.deadline).toLocaleDateString('de-CH')}` : ''}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(g.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <Progress value={pct} className="mt-3" />
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input type="number" step="0.01" min="0" placeholder="Sparbetrag eintragen" value={contributions[g.id] ?? ''} onChange={(e) => setContributions((c) => ({ ...c, [g.id]: e.target.value }))} className="sm:max-w-[200px]" />
                  <Button variant="outline" size="sm" onClick={() => handleContribute(g)}>
                    <TrendingUp className="mr-1 h-4 w-4" /> Einzahlen
                  </Button>
                </div>
              </div>
            );
          })
        )}

        <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2 lg:grid-cols-6">
          <Input placeholder="Zielname (z.B. Notgroschen)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input type="number" step="0.01" min="0" placeholder="Zielbetrag" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} />
          <Input type="number" step="0.01" min="0" placeholder="Schon gespart" value={newSaved} onChange={(e) => setNewSaved(e.target.value)} />
          <Select value={newCurrency} onValueChange={(v) => setNewCurrency(v as CurrencyCode)}>
            <SelectTrigger><SelectValue placeholder="Währung" /></SelectTrigger>
            <SelectContent>{SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
          <Button onClick={handleAdd} disabled={isAdding}>
            <Plus className="mr-1 h-4 w-4" /> {isAdding ? 'Speichert...' : 'Ziel'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
