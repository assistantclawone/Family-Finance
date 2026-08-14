'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Hospital, HeartPulse, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchEmergencyContacts, addEmergencyContact } from '@/lib/supabase/data';
import { useToast } from '@/hooks/use-toast';
import type { EmergencyContact } from '@/lib/types';

const getIcon = (type: string) => {
  switch (type) {
    case 'doctor':
      return <HeartPulse className="h-6 w-6 text-primary" />;
    case 'hospital':
      return <Hospital className="h-6 w-6 text-destructive" />;
    case 'emergency':
      return <Phone className="h-6 w-6 text-yellow-500" />;
    default:
      return <HeartPulse className="h-6 w-6 text-primary" />;
  }
};

export function EmergencyContacts() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'doctor' | 'hospital' | 'emergency'>('doctor');
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      setContacts(await fetchEmergencyContacts());
    } catch (e) {
      console.error(e);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!name || !phone) {
      toast({ variant: 'destructive', title: 'Unvollständige Angaben', description: 'Bitte Name und Telefonnummer ausfüllen.' });
      return;
    }
    setIsSaving(true);
    try {
      await addEmergencyContact({ name, specialty, phone, type });
      toast({ title: 'Kontakt hinzugefügt', description: 'Der Notfallkontakt wurde gespeichert.' });
      setName(''); setSpecialty(''); setPhone(''); setType('doctor'); setShowAdd(false);
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
          <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-destructive" /> Notfallkontakte</CardTitle>
          <CardDescription>Wichtige Kontakte für den Notfall.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showAdd ? 'Schliessen' : 'Hinzufügen'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Spezialgebiet (z.B. Notaufnahme)" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
            <Input placeholder="Telefonnummer" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="doctor">Arzt</option>
              <option value="hospital">Krankenhaus</option>
              <option value="emergency">Notruf</option>
            </select>
            <Button className="sm:col-span-2" onClick={handleAdd} disabled={isSaving}>
              {isSaving ? 'Wird gespeichert...' : 'Kontakt speichern'}
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Notfallkontakte erfasst.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-start gap-4 rounded-lg border p-4">
                <div className="bg-muted p-2 rounded-md">{getIcon(contact.type)}</div>
                <div>
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.specialty}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline">{contact.phone}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
