'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { getDataForRegion } from '@/lib/data';
import { useRegion } from '@/contexts/region-context';

export function AppointmentList() {
  const { region } = useRegion();
  const { appointments } = getDataForRegion(region);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Nächste Termine</CardTitle>
        <CardDescription>Eine Übersicht der anstehenden Arzttermine.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum & Uhrzeit</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Arzt/Zweck</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
