'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Hospital, HeartPulse } from 'lucide-react';
import { getDataForRegion } from '@/lib/data';
import { useRegion } from '@/contexts/region-context';

export function EmergencyContacts() {
  const { region } = useRegion();
  const { emergencyContacts } = getDataForRegion(region);

  const getIcon = (type: string) => {
    switch(type) {
      case 'doctor':
        return <HeartPulse className="h-6 w-6 text-primary" />;
      case 'hospital':
        return <Hospital className="h-6 w-6 text-destructive" />;
      case 'emergency':
        return <Phone className="h-6 w-6 text-yellow-500" />;
      default:
        return <HeartPulse className="h-6 w-6 text-primary" />;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-destructive" /> Notfallkontakte</CardTitle>
        <CardDescription>Wichtige Kontakte für den Notfall.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {emergencyContacts.map((contact) => (
          <div key={contact.id} className="flex items-start gap-4 rounded-lg border p-4">
            <div className="bg-muted p-2 rounded-md">
                {getIcon(contact.type)}
            </div>
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
      </CardContent>
    </Card>
  );
}
