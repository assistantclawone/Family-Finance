'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Landmark, Briefcase, Home, Car, Palette, Bitcoin, Banknote, HandCoins, PiggyBank, Receipt as ReceiptIcon, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Asset, AssetType, CurrencyCode, BindingCategory, TaxCategory } from '@/lib/types';
import { useRegion } from '@/contexts/region-context';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchAssets, addAsset, deleteAsset } from '@/lib/supabase/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { convertCurrency, formatCurrencyAmount, REFERENCE_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/currency';

const assetIcons: { [key: string]: React.ElementType } = {
  'Bank Account': Landmark,
  Portfolio: Briefcase,
  Other: Wallet,
  'Savings 3a': PiggyBank,
  'Savings 3b': PiggyBank,
  'Vested Benefits': PiggyBank,
  Pension: PiggyBank,
  Property: Home,
  Vehicle: Car,
  Art: Palette,
  Crypto: Bitcoin,
  Cash: Banknote,
  Receivable: HandCoins,
};

const assetTypes: AssetType[] = [
  'Bank Account',
  'Cash',
  'Receivable',
  'Portfolio',
  'Savings 3a',
  'Savings 3b',
  'Vested Benefits',
  'Pension',
  'Property',
  'Vehicle',
  'Art',
  'Crypto',
  'Other',
];

const bindingOptions: { value: BindingCategory; label: string }[] = [
  { value: 'free', label: 'Frei (ungebunden)' },
  { value: 'pillar3a', label: 'Säule 3a (gebunden)' },
  { value: 'pillar3b', label: 'Säule 3b' },
  { value: 'vested', label: 'Freizügigkeit 2. Säule' },
  { value: 'pillar2', label: 'Pensionskasse (2. Säule)' },
];

const taxOptions: { value: TaxCategory; label: string }[] = [
  { value: 'bankbalances', label: 'Guthaben (Bank/Kasse)' },
  { value: 'securities', label: 'Wertschriften' },
  { value: 'movable', label: 'Bewegliches Vermögen' },
  { value: 'immobile', label: 'Immobilien' },
  { value: 'receivables', label: 'Forderungen' },
  { value: 'liabilities', label: 'Schulden' },
];

function bindingLabel(binding?: BindingCategory): string {
  if (!binding) return '—';
  return bindingOptions.find((b) => b.value === binding)?.label ?? binding;
}
function taxLabel(tax?: TaxCategory): string {
  if (!tax) return '—';
  return taxOptions.find((t) => t.value === tax)?.label ?? tax;
}

function AssetRow({ asset, onDelete, deleting, locale }: { asset: Asset; onDelete: (id: string) => void; deleting: boolean; locale: string }) {
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
      <TableCell className="text-sm text-muted-foreground">{bindingLabel(asset.binding)}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{taxLabel(asset.taxCategory)}</TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrencyAmount(asset.balance, asset.currency, locale)}
        {asset.currency !== REFERENCE_CURRENCY && (
          <div className="text-xs text-muted-foreground">
            ≈ {formatCurrencyAmount(convertCurrency(asset.balance, asset.currency), REFERENCE_CURRENCY, locale)}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" disabled={deleting} onClick={() => onDelete(asset.id)} aria-label={`${asset.name} löschen`}>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function AssetList() {
  const { locale } = useRegion();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>(REFERENCE_CURRENCY);
  const [newType, setNewType] = useState<AssetType>('Bank Account');
  const [newBinding, setNewBinding] = useState<BindingCategory | null>(null);
  const [newTax, setNewTax] = useState<TaxCategory | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const loadAssets = async () => {
    if (!user || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAssets();
      setAssets(data);
    } catch (e: any) {
      console.error('Fehler beim Laden der Vermögenswerte:', e);
      setError('Die Vermögenswerte konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAdd = async () => {
    const name = newName.trim();
    const balance = Number(newBalance);
    if (!name || isNaN(balance) || balance < 0) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte Name und einen gültigen Betrag erfassen.' });
      return;
    }
    if (!isSupabaseConfigured) return;
    setIsAdding(true);
    try {
      await addAsset({ name, type: newType, balance, currency: newCurrency, taxCategory: newTax ?? undefined, binding: newBinding ?? undefined });
      setNewName('');
      setNewBalance('');
      setNewType('Bank Account');
      setNewCurrency(REFERENCE_CURRENCY);
      setNewBinding(null);
      setNewTax(null);
      toast({ title: 'Vermögenswert erstellt!', description: 'Der Vermögenswert wurde erfolgreich gespeichert.' });
      await loadAssets();
    } catch (e: any) {
      console.error('Fehler beim Anlegen des Vermögenswerts:', e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Der Vermögenswert konnte nicht gespeichert werden.' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured) return;
    setDeletingId(id);
    try {
      await deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Gelöscht', description: 'Der Vermögenswert wurde entfernt.' });
    } catch (e: any) {
      console.error('Fehler beim Löschen:', e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Der Vermögenswert konnte nicht gelöscht werden.' });
    } finally {
      setDeletingId(null);
    }
  };

  const totalRef = assets.reduce((sum, asset) => sum + convertCurrency(asset.balance, asset.currency, REFERENCE_CURRENCY), 0);
  const formattedTotal = formatCurrencyAmount(totalRef, REFERENCE_CURRENCY, locale);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vermögenswerte</CardTitle>
        <CardDescription>
          Eine Übersicht Ihrer Konten und Anlagen{assets.length > 0 ? `. Gesamt (${REFERENCE_CURRENCY}): ` : '. '}
          {assets.length > 0 && <span className="font-bold text-foreground">{formattedTotal}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUserLoading || isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>
            ))}
          </div>
        ) : !user || !isSupabaseConfigured ? (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Anmeldung erforderlich</AlertTitle>
            <AlertDescription>Melden Sie sich an, um Ihre Vermögenswerte zu sehen.</AlertDescription>
          </Alert>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Daten — legen Sie den ersten Eintrag an.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Bindung</TableHead>
                <TableHead>Steuerkategorie</TableHead>
                <TableHead className="text-right">Wert</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <AssetRow key={asset.id} asset={asset} deleting={deletingId === asset.id} onDelete={handleDelete} locale={locale} />
              ))}
            </TableBody>
          </Table>
        )}
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <Input placeholder="Name (z.B. Girokonto)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input type="number" step="0.01" min="0" placeholder="Betrag" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} />
          <Select value={newType} onValueChange={(v) => setNewType(v as AssetType)}>
            <SelectTrigger><SelectValue placeholder="Typ" /></SelectTrigger>
            <SelectContent>
              {assetTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={newCurrency} onValueChange={(v) => setNewCurrency(v as CurrencyCode)}>
            <SelectTrigger><SelectValue placeholder="Währung" /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={newBinding ?? 'free'} onValueChange={(v) => setNewBinding(v as BindingCategory)}>
            <SelectTrigger><SelectValue placeholder="Bindung" /></SelectTrigger>
            <SelectContent>
              {bindingOptions.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={newTax ?? 'bankbalances'} onValueChange={(v) => setNewTax(v as TaxCategory)}>
            <SelectTrigger><SelectValue placeholder="Steuerkategorie" /></SelectTrigger>
            <SelectContent>
              {taxOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button className="mt-3 w-full sm:w-auto" onClick={handleAdd} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          {isAdding ? 'Wird gespeichert...' : 'Vermögenswert hinzufügen'}
        </Button>
      </CardContent>
    </Card>
  );
}
