'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, User, Building } from 'lucide-react';
import { getDataForRegion } from '@/lib/data';
import { useRegion } from '@/contexts/region-context';

export function InsurancePolicies() {
  const { region } = useRegion();
  const { healthInsurances } = getDataForRegion(region);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Krankenversicherungen</CardTitle>
        <CardDescription>Übersicht der Versicherungspolicen der Familie.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {healthInsurances.map((insurance) => (
            <AccordionItem value={`item-${insurance.id}`} key={insurance.id}>
              <AccordionTrigger>
                <div className='flex items-center gap-2'>
                    <User className="h-4 w-4 text-muted-foreground"/>
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
                    <p className="text-sm text-muted-foreground">{insurance.policyNumber}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
