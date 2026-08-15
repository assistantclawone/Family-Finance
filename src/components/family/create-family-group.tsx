'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createFamilyGroup } from '@/lib/supabase/data';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Der Name muss mindestens 2 Zeichen lang sein.' }),
  description: z.string().optional(),
});

export function CreateFamilyGroup({ onCreated }: { onCreated?: () => void }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !isSupabaseConfigured) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein, um eine Gruppe zu erstellen.',
      });
      return;
    }
    setIsLoading(true);

    try {
      await createFamilyGroup(user.id, values.name, values.description || undefined);

      toast({
        title: 'Gruppe erstellt!',
        description: `Die Gruppe "${values.name}" wurde erfolgreich erstellt.`,
      });
      form.reset();
      // Sofort neu laden, damit die Gruppe sichtbar wird
      onCreated?.();
    } catch (error) {
      console.error('Fehler beim Erstellen der Gruppe:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Etwas ist schief gelaufen.',
        description: 'Die Gruppe konnte nicht erstellt werden.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Neue Familiengruppe erstellen</CardTitle>
            <CardDescription>Erstellen Sie einen neuen Bereich für die Zusammenarbeit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gruppenname</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Familie Müller" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Finanzplanung für unser Zuhause" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'Gruppe erstellen'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
