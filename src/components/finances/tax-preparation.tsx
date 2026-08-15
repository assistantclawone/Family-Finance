'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileDown, Landmark, Building2, LineChart, Banknote, HandCoins, MessageSquareWarning } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchAssets } from '@/lib/supabase/data';
import type { Asset, TaxCategory } from '@/lib/types';
import { convertCurrency, formatCurrencyAmount, REFERENCE_CURRENCY } from '@/lib/currency';

interface TaxGroup {
  key: TaxCategory | 'notassigned';
  label: string;
  icon: React.ElementType;
  description: string;
  assets: Asset[];
  totalRef: number;
}

function taxMeta(key: TaxCategory | 'notassigned'): { label: string; icon: React.ElementType; description: string } {
  switch (key) {
    case 'bankbalances':
      return { label: 'Guthaben (Bank, Kasse, Bargeld)', icon: Banknote, description: 'Bank- und Postkonten, Bargeld — inkl. Savings konten.' };
    case 'securities':
      return { label: 'Wertschriften', icon: LineChart, description: 'Aktien, ETF, Fonds, Obligationen — zum Verkehrswert am Stichtag.' };
    case 'movable':
      return { label: 'Bewegliches Vermögen', icon: Building2, description: 'Übriges bewegliches Vermögen (Fahrzeuge, Kunst, Crypto).' };
    case 'immobile':
      return { label: 'Immobiles Vermögen (Grundstücke, Gebäude)', icon: Landmark, description: 'Liegenschaften — Eigenmietwert/Steuerwert beachten.' };
    case 'receivables':
      return { label: 'Forderungen', icon: HandCoins, description: 'Ausstehende Forderungen gegenüber Dritten.' };
    case 'liabilities':
      return { label: 'Schulden (abzugsfähig)', icon: MessageSquareWarning, description: 'Hypotheken und übrige Schulden werden vom Vermögen abgezogen.' };
    default:
      return { label: 'Noch keiner Kategorie zugeordnet', icon: FileDown, description: 'Bitte weisen Sie diesen Positionen eine Steuerkategorie zu (Finanzen → Vermögenswerte).' };
  }
}

export function TaxPreparation() {
  const { user } = useUser();
  const { toast } = useToast();
  const { locale } = { locale: 'de-CH' };
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = isSupabaseConfigured;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user || !isConfigured) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await fetchAssets();
        if (mounted) setAssets(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, isConfigured]);

  const groups: TaxGroup[] = (['bankbalances', 'securities', 'movable', 'immobile', 'receivables', 'liabilities'] as TaxCategory[]).map((key) => {
    const list = assets.filter((a) => a.taxCategory === key);
    return {
      key,
      label: taxMeta(key).label,
      icon: taxMeta(key).icon,
      description: taxMeta(key).description,
      assets: list,
      totalRef: list.reduce((s, a) => s + convertCurrency(a.balance, a.currency, REFERENCE_CURRENCY), 0),
    };
  });
  const notAssigned = assets.filter((a) => !a.taxCategory);
  const notAssignedTotal = notAssigned.reduce((s, a) => s + convertCurrency(a.balance, a.currency, REFERENCE_CURRENCY), 0);

  // Reines Vermögen ohne Schulden
  const grossWealth = groups.filter((g) => g.key !== 'liabilities').reduce((s, g) => s + g.totalRef, 0);
  const liabilities = groups.find((g) => g.key === 'liabilities')?.totalRef ?? 0;
  const netWealth = grossWealth - liabilities;

  const exportText = () => {
    const rows: string[] = [];
    rows.push('===== Steuererklärungs-Vorbereitung (Vermögensaufstellung) =====');
    rows.push(`Erstellt: ${new Date().toLocaleDateString('de-CH')}`);
    rows.push('');
    [...groups, { ...taxMeta('notassigned'), key: 'notassigned' as const, assets: notAssigned, totalRef: notAssignedTotal }].forEach((g) => {
      rows.push(`### ${g.label}`);
      if (g.assets.length === 0) { rows.push('  (keine Posten)'); return; }
      g.assets.forEach((a) => {
        const ref = convertCurrency(a.balance, a.currency, REFERENCE_CURRENCY);
        rows.push(`  - ${a.name}: ${formatCurrencyAmount(a.balance, a.currency, locale)} (≈ CHF ${ref.toFixed(2)})`);
      });
      rows.push(`  Σ ${formatCurrencyAmount(g.totalRef, REFERENCE_CURRENCY, locale)}`);
      rows.push('');
    });
    rows.push(`Brutto-Vermögen: ${formatCurrencyAmount(grossWealth, REFERENCE_CURRENCY, locale)}`);
    rows.push(`Schulden: ${formatCurrencyAmount(liabilities, REFERENCE_CURRENCY, locale)}`);
    rows.push(`Netto-Vermögen (steuerbar): ${formatCurrencyAmount(netWealth, REFERENCE_CURRENCY, locale)}`);
    rows.push('');
    rows.push('Hinweis: Diese Aufstellung ist eine Hilfestellung und ersetzt keine Steuerberatung.');
    rows.push('Quellensteuer- und Abzugsregeln können je Kanton abweichen.');
    return rows.join('\n');
  };

  const handleExport = () => {
    const blob = new Blob([exportText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vermoegensaufstellung.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export erstellt', description: 'Die Vermögensaufstellung wurde heruntergeladen.' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Steuererklärung-Vorbereitung</CardTitle>
          <CardDescription>
            Automatische Aufstellung Ihres Vermögens nach Schweizer Steuerkategorien. Bitte weisen Sie bei den Vermögenswerten (Finanzen) die passende Steuerkategorie zu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Brutto-Vermögen</div>
              <div className="text-2xl font-bold font-headline">{formatCurrencyAmount(grossWealth, REFERENCE_CURRENCY, locale)}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Schulden</div>
              <div className="text-2xl font-bold font-headline text-red-600">− {formatCurrencyAmount(liabilities, REFERENCE_CURRENCY, locale)}</div>
            </div>
            <div className="rounded-lg border p-4 bg-primary/5">
              <div className="text-sm text-muted-foreground">Netto-Vermögen (steuerbar)</div>
              <div className="text-2xl font-bold font-headline">{formatCurrencyAmount(netWealth, REFERENCE_CURRENCY, locale)}</div>
            </div>
          </div>
          <Button className="mt-4" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" /> Aufstellung exportieren (Text)
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : (
        [...groups, { key: 'notassigned' as const, label: taxMeta('notassigned').label, icon: taxMeta('notassigned').icon, description: taxMeta('notassigned').description, assets: notAssigned, totalRef: notAssignedTotal }].map((g) => (
          <Card key={g.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><g.icon className="h-5 w-5 text-muted-foreground" /> {g.label}</CardTitle>
              <CardDescription>{g.description} · Summe: <span className="font-semibold text-foreground">{formatCurrencyAmount(g.totalRef, REFERENCE_CURRENCY, locale)}</span></CardDescription>
            </CardHeader>
            <CardContent>
              {g.assets.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Posten in dieser Kategorie.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Bezeichnung</TableHead><TableHead className="text-right">Wert (Original)</TableHead><TableHead className="text-right">Wert (CHF)</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {g.assets.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.name}</TableCell>
                        <TableCell className="text-right">{formatCurrencyAmount(a.balance, a.currency, locale)}</TableCell>
                        <TableCell className="text-right">{formatCurrencyAmount(convertCurrency(a.balance, a.currency, REFERENCE_CURRENCY), REFERENCE_CURRENCY, locale)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))
      )}

      <Card>
        <CardHeader>
          <CardTitle>Hinweise zur Schweizer Steuererklärung</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Vermögenssteuer:</strong> Das Netto-Vermögen wird je nach Wohnkanton mit einem Steuersatz erfasst. Die Freibeträge variieren pro Kanton.</p>
          <p>• <strong>Wertschriften:</strong> Zum Vermögenssteuerwert am Stichtag (31.12.) — üblicherweise der Kurswert an diesem Datum.</p>
          <p>• <strong>Immobilien:</strong> Grundstücke und Gebäude werden zum Steuerwert amtlich bewertet, nicht zum Marktwert.</p>
          <p>• <strong>Abzüge:</strong> Schulden (Hypotheken) und Bankkredite werden vom Vermögen abgezogen. Auch gewisse Versicherungsprämien und Weiterbildungskosten können abzugsfähig sein.</p>
          <p>• <strong>Quellensteuer:</strong> Bei quellensteuerpflichtigen Personen wird die Einkommens- und Vermögenssteuer direkt vom Lohn abgezogen. Je nach Wohnsitzkanton kann eine Nachdeklaration nötig sein.</p>
          <p>• Die Verrechnungssteuer (35%) auf Wertschriftenerträgen wird in der Regel über die Steuererklärung rückerstattet.</p>
          <p><em>Diese Aufstellung dient nur als Hilfestellung und ersetzt keine professionelle Steuerberatung.</em></p>
        </CardContent>
      </Card>
    </div>
  );
}
