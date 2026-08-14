'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Landmark, Briefcase, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Asset } from '@/lib/types';
import { useRegion } from '@/contexts/region-context';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchAssets, addAsset, deleteAsset } from '@/lib/supabase/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const assetIcons: { [key: string]: React.ElementType } = {
  'Bank Account': Landmark,
  Portfolio: Briefcase,
  Other: Wallet,
};

function AssetRow({ asset, onDelete, deleting }: { asset: Asset; onDelete: (id: string) => void; deleting: boolean }) {
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
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" disabled={deleting} onClick={() => onDelete(asset.id)} aria-label={`${asset.name} löschen`}>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function AssetList() {
  const { locale, currency } = useRegion();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
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
      await addAsset({ name, type: 'Bank Account', balance, currency });
      setNewName('');
      setNewBalance('');
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

  const totalAssets = assets.reduce((sum, asset) => sum + asset.balance, 0);
  const formattedTotalAssets = new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(totalAssets);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vermögenswerte</CardTitle>
        <CardDescription>
          Eine Übersicht Ihrer aktuellen Konten und Anlagen{assets.length > 0 ? `. Gesamt: ` : '. '}
          {assets.length > 0 && <span className="font-bold text-foreground">{formattedTotalAssets}</span>}
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
                <TableHead className="text-right">Kontostand</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <AssetRow key={asset.id} asset={asset} deleting={deletingId === asset.id} onDelete={handleDelete} />
              ))}
            </TableBody>
          </Table>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input placeholder="Name (z.B. Girokonto)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input type="number" step="0.01" min="0" placeholder="Betrag" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} />
          <Button onClick={handleAdd} disabled={isAdding}>
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? 'Wird gespeichert...' : 'Vermögenswert hinzufügen'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
