'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAppointments, addAppointment, deleteAppointment } from '@/lib/supabase/data';
import { useToast } from '@/hooks/use-toast';
import type { Appointment } from '@/lib/types';

export function AppointmentList() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [patient, setPatient] = useState('');
  const [doctor, setDoctor] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      setAppointments(await fetchAppointments());
    } catch (e) {
      console.error(e);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!patient || !doctor || !date) {
      toast({ variant: 'destructive', title: 'Unvollständige Angaben', description: 'Bitte Patient, Arzt und Datum ausfüllen.' });
      return;
    }
    setIsSaving(true);
    try {
      await addAppointment({ date: new Date(date).toISOString(), patient, doctor, purpose });
      toast({ title: 'Termin erstellt', description: 'Der Termin wurde gespeichert.' });
      setPatient(''); setDoctor(''); setPurpose(''); setDate(''); setShowAdd(false);
      load();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Termin konnte nicht gespeichert werden.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAppointment(id);
      load();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Nächste Termine</CardTitle>
          <CardDescription>Übersicht der anstehenden Arzttermine.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus className="mr-1 h-4 w-4" /> Termin
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
            <Input placeholder="Patient" value={patient} onChange={(e) => setPatient(e.target.value)} />
            <Input placeholder="Arzt" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
            <Input placeholder="Zweck" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button className="sm:col-span-2" onClick={handleAdd} disabled={isSaving}>
              {isSaving ? 'Wird gespeichert...' : 'Termin speichern'}
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Termine. Fügen Sie den ersten hinzu.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum & Uhrzeit</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Arzt/Zweck</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="font-medium">{new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}</div>
                    <div className="text-sm text-muted-foreground">{new Date(appointment.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</div>
                  </TableCell>
                  <TableCell>{appointment.patient}</TableCell>
                  <TableCell>
                    <div>{appointment.doctor}</div>
                    <div className="text-sm text-muted-foreground">{appointment.purpose}</div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(appointment.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
