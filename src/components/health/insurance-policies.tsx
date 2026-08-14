'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, User, Building, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchHealthInsurances, addHealthInsurance } from '@/lib/supabase/data';
import { useToast } from '@/hooks/use-toast';
import type { HealthInsurance } from '@/lib/types';

export function InsurancePolicies() {
  const { toast } = useToast();
  const [insurances, setInsurances] = useState<HealthInsurance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      setInsurances(await fetchHealthInsurances());
    } catch (e) {
      console.error(e);
      setInsurances([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!provider || !memberName) {
      toast({ variant: 'destructive', title: 'Unvollständige Angaben', description: 'Bitte Mitglied und Anbieter ausfüllen.' });
      return;
    }
    setIsSaving(true);
    try {
      await addHealthInsurance({ memberName, provider, policyNumber, type: 'gesetzlich' });
      toast({ title: 'Versicherung hinzugefügt', description: 'Die Police wurde gespeichert.' });
      setMemberName(''); setProvider(''); setPolicyNumber(''); setShowAdd(false);
      load();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Konnte nicht gespeichert werden.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Krankenversicherungen</CardTitle>
          <CardDescription>Übersicht der Versicherungspolicen der Familie.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showAdd ? 'Schliessen' : 'Hinzufügen'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
            <Input placeholder="Mitglied" value={memberName} onChange={(e) => setMemberName(e.target.value)} />
            <Input placeholder="Anbieter" value={provider} onChange={(e) => setProvider(e.target.value)} />
            <Input placeholder="Versicherungsnummer" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
            <Button onClick={handleAdd} disabled={isSaving}>
              {isSaving ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : insurances.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Versicherungen erfasst.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {insurances.map((insurance) => (
              <AccordionItem value={`item-${insurance.id}`} key={insurance.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{insurance.memberName}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pl-6">
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{insurance.provider}</p>
                      <p className="text-sm text-muted-foreground">Typ: {insurance.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Versicherungsnummer</p>
                      <p className="text-sm text-muted-foreground">{insurance.policyNumber || '—'}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
