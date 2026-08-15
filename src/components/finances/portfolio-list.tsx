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
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  fetchPortfolios,
  addPortfolio,
  deletePortfolio,
  fetchStockPositions,
  addStockPosition,
  deleteStockPosition,
} from '@/lib/supabase/data';
import type { Portfolio, StockPosition, CurrencyCode } from '@/lib/types';
import { convertCurrency, formatCurrencyAmount, REFERENCE_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/currency';

const portfolioTypes = [
  { value: 'depot', label: 'Depot (Aktien/ETF)' },
  { value: 'fonds', label: 'Fonds' },
  { value: 'bank', label: 'Bankkonto' },
  { value: 'krypto', label: 'Krypto' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

export function PortfolioList() {
  const { user } = useUser();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [positions, setPositions] = useState<Record<string, StockPosition[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);

  // Add portfolio form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>(REFERENCE_CURRENCY);
  const [newType, setNewType] = useState('depot');
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);

  // Add position form
  const [posName, setPosName] = useState('');
  const [posIsin, setPosIsin] = useState('');
  const [posTicker, setPosTicker] = useState('');
  const [posQty, setPosQty] = useState('');
  const [posBuy, setPosBuy] = useState('');
  const [posPrice, setPosPrice] = useState('');
  const [isAddingPosition, setIsAddingPosition] = useState(false);

  const isConfigured = isSupabaseConfigured;

  async function load() {
    if (!user || !isConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const ps = await fetchPortfolios();
      setPortfolios(ps);
      const posMap: Record<string, StockPosition[]> = {};
      await Promise.all(
        ps.map(async (p) => {
          posMap[p.id] = await fetchStockPositions(p.id);
        }),
      );
      setPositions(posMap);
      if (ps.length > 0 && !activePortfolioId) setActivePortfolioId(ps[0].id);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Portfolios konnten nicht geladen werden.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleAddPortfolio() {
    if (!user || !isConfigured || !newName.trim()) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte einen Namen angeben.' });
      return;
    }
    setIsAddingPortfolio(true);
    try {
      const p = await addPortfolio({ name: newName.trim(), description: newDesc.trim() || undefined, currency: newCurrency, type: newType });
      setPortfolios((prev) => [...prev, p]);
      setActivePortfolioId(p.id);
      setNewName(''); setNewDesc(''); setNewCurrency(REFERENCE_CURRENCY); setNewType('depot');
      toast({ title: 'Portfolio erstellt!', description: 'Das Depot wurde angelegt.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Portfolio konnte nicht erstellt werden.' });
    } finally {
      setIsAddingPortfolio(false);
    }
  }

  async function handleDeletePortfolio(id: string) {
    try {
      await deletePortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
      setPositions((prev) => { const c = { ...prev }; delete c[id]; return c; });
      if (activePortfolioId === id) setActivePortfolioId(portfolios[0]?.id ?? null);
      toast({ title: 'Gelöscht', description: 'Portfolio entfernt.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Portfolio konnte nicht gelöscht werden.' });
    }
  }

  async function handleAddPosition(portfolioId: string) {
    const name = posName.trim();
    const qty = Number(posQty);
    const buy = Number(posBuy);
    const price = Number(posPrice);
    if (!name || isNaN(qty) || isNaN(buy) || isNaN(price)) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte Name, Stückzahl, Kauf- und aktuellen Kurs angeben.' });
      return;
    }
    setIsAddingPosition(true);
    try {
      const portfolio = portfolios.find((p) => p.id === portfolioId);
      const currency = portfolio?.currency ?? REFERENCE_CURRENCY;
      const added = await addStockPosition({
        portfolioId,
        name,
        isin: posIsin.trim() || undefined,
        ticker: posTicker.trim() || undefined,
        quantity: qty,
        purchasePrice: buy,
        currentPrice: price,
        currency,
      });
      setPositions((prev) => ({ ...prev, [portfolioId]: [...(prev[portfolioId] ?? []), added] }));
      setPosName(''); setPosIsin(''); setPosTicker(''); setPosQty(''); setPosBuy(''); setPosPrice('');
      toast({ title: 'Position hinzugefügt!', description: 'Die Aktie/der ETF wurde gespeichert.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Position konnte nicht gespeichert werden.' });
    } finally {
      setIsAddingPosition(false);
    }
  }

  async function handleDeletePosition(portfolioId: string, id: string) {
    try {
      await deleteStockPosition(id);
      setPositions((prev) => ({ ...prev, [portfolioId]: (prev[portfolioId] ?? []).filter((p) => p.id !== id) }));
      toast({ title: 'Gelöscht', description: 'Position entfernt.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Position konnte nicht gelöscht werden.' });
    }
  }

  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId);
  const activePositions = activePortfolioId ? (positions[activePortfolioId] ?? []) : [];

  // Positionswert je Position (Stückzahl * aktueller Kurs) und Gewinn/Verlust
  const positionValues = activePositions.map((p) => {
    const currentValue = p.quantity * p.currentPrice;
    const buyValue = p.quantity * p.purchasePrice;
    const pnl = currentValue - buyValue;
    return { position: p, currentValue, buyValue, pnl };
  });
  const portfolioValue = positionValues.reduce((s, v) => s + convertCurrency(v.currentValue, v.position.currency, REFERENCE_CURRENCY), 0);
  const portfolioPnl = positionValues.reduce((s, v) => s + convertCurrency(v.pnl, v.position.currency, REFERENCE_CURRENCY), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Portfolios & Depots</CardTitle>
          <CardDescription>Verwalten Sie Ihre Portfolios mit Aktien- und ETF-Positionen (ISIN, Ticker, Stückzahl, aktueller Kurs).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {portfolios.map((p) => (
                  <Button
                    key={p.id}
                    variant={activePortfolioId === p.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActivePortfolioId(p.id)}
                  >
                    {p.name}
                    <span className="ml-2 text-xs opacity-70">{formatCurrencyAmount(portfolioValueForId(positions[p.id] ?? [], p.currency, REFERENCE_CURRENCY), REFERENCE_CURRENCY)}</span>
                  </Button>
                ))}
                {portfolios.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Portfolios. Legen Sie das erste an.</p>}
              </div>

              <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-6">
                <Input placeholder="Name (z.B. SwissQuote)" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input placeholder="Beschreibung (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="lg:col-span-2" />
                <Select value={newCurrency} onValueChange={(v) => setNewCurrency(v as CurrencyCode)}>
                  <SelectTrigger><SelectValue placeholder="Währung" /></SelectTrigger>
                  <SelectContent>{SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue placeholder="Typ" /></SelectTrigger>
                  <SelectContent>{portfolioTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={handleAddPortfolio} disabled={isAddingPortfolio}>
                  <Plus className="mr-1 h-4 w-4" /> {isAddingPortfolio ? 'Speichert...' : 'Portfolio'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {activePortfolio && (
        <Card>
          <CardHeader>
            <CardTitle>{activePortfolio.name} — Positionen</CardTitle>
            <CardDescription>
              Depotwert (Referenzwährung {REFERENCE_CURRENCY}): <span className="font-bold text-foreground">{formatCurrencyAmount(portfolioValue, REFERENCE_CURRENCY)}</span>
              {' · '}Gewinn/Verlust:{' '}
              <span className={`font-bold ${portfolioPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {portfolioPnl >= 0 ? <TrendingUp className="mr-1 inline h-4 w-4" /> : <TrendingDown className="mr-1 inline h-4 w-4" />}
                {formatCurrencyAmount(portfolioPnl, REFERENCE_CURRENCY)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePositions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ISIN / Ticker</TableHead>
                    <TableHead className="text-right">Stück</TableHead>
                    <TableHead className="text-right">Kaufkurs</TableHead>
                    <TableHead className="text-right">Aktueller Kurs</TableHead>
                    <TableHead className="text-right">Positionswert</TableHead>
                    <TableHead className="text-right">Gewinn/Verlust</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionValues.map(({ position, currentValue, buyValue, pnl }) => (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{position.isin || position.ticker || '—'}</TableCell>
                      <TableCell className="text-right">{position.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrencyAmount(position.purchasePrice, position.currency)}</TableCell>
                      <TableCell className="text-right">{formatCurrencyAmount(position.currentPrice, position.currency)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrencyAmount(currentValue, position.currency)}</TableCell>
                      <TableCell className="text-right">
                        <span className={pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}>{formatCurrencyAmount(pnl, position.currency)}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePosition(activePortfolio.id, position.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Positionen. Fügen Sie die erste Aktie/den ersten ETF hinzu.</p>
            )}

            <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-4 lg:grid-cols-7">
              <Input placeholder="Name (z.B. Nestlé)" value={posName} onChange={(e) => setPosName(e.target.value)} />
              <Input placeholder="ISIN (optional)" value={posIsin} onChange={(e) => setPosIsin(e.target.value)} />
              <Input placeholder="Ticker (optional)" value={posTicker} onChange={(e) => setPosTicker(e.target.value)} />
              <Input type="number" step="any" min="0" placeholder="Stückzahl" value={posQty} onChange={(e) => setPosQty(e.target.value)} />
              <Input type="number" step="any" min="0" placeholder="Kaufkurs" value={posBuy} onChange={(e) => setPosBuy(e.target.value)} />
              <Input type="number" step="any" min="0" placeholder="Aktueller Kurs" value={posPrice} onChange={(e) => setPosPrice(e.target.value)} />
              <Button onClick={() => handleAddPosition(activePortfolio.id)} disabled={isAddingPosition}>
                <Plus className="mr-1 h-4 w-4" /> {isAddingPosition ? 'Speichert...' : 'Position'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Kleinere Hilfsfunktion für die Summe eines Portfolios in Referenzwährung. */
function portfolioValueForId(list: StockPosition[], _portfolioCurrency: CurrencyCode, ref: CurrencyCode): number {
  return list.reduce((s, p) => s + convertCurrency(p.quantity * p.currentPrice, p.currency, ref), 0);
}
