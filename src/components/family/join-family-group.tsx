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
import { fetchFamilyGroups, joinFamilyGroup } from '@/lib/supabase/data';
import type { FamilyGroup } from '@/lib/types';

const formSchema = z.object({
  groupId: z.string().min(1, { message: 'Die Gruppen-ID darf nicht leer sein.' }),
});

export function JoinFamilyGroup({ onChanged }: { onChanged?: () => void }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isConfigured = isSupabaseConfigured;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !isConfigured) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein, um einer Gruppe beizutreten.',
      });
      return;
    }
    setIsLoading(true);

    try {
      // Lade alle Gruppen, zu denen der Nutzer Sicht hat (Eigentümer oder Mitglied).
      const owned = await fetchFamilyGroups(user.id);
      const target = owned.find((g) => g.id === values.groupId);

      if (!target) {
        // Gruppe ist nicht sichtbar: Der Nutzer ist weder Mitglied noch Eigentümer.
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: 'Gruppe nicht gefunden oder Sie sind kein Eigentümer dieser Gruppe.',
        });
        return;
      }

      if (target.memberIds.includes(user.id)) {
        toast({
          title: 'Bereits Mitglied',
          description: 'Sie sind bereits Mitglied in dieser Gruppe.',
        });
        return;
      }

      // Nur der Eigentümer darf per RLS die Mitgliederliste ändern.
      if (target.ownerId !== user.id) {
        toast({
          title: 'Beitritt nur über den Eigentümer',
          description: `Bitte bitten Sie den Eigentümer der Gruppe "${target.name}", Sie hinzuzufügen.`,
        });
        return;
      }

      await joinFamilyGroup(target, user.id);
      toast({
        title: 'Erfolgreich beigetreten!',
        description: `Sie sind nun Mitglied der Gruppe "${target.name}".`,
      });
      onChanged?.();
      form.reset();
    } catch (error) {
      console.error('Fehler beim Beitritt zur Gruppe:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Etwas ist schief gelaufen.',
        description: 'Der Gruppe konnte nicht beigetreten werden.',
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
            <CardTitle>Einer Gruppe beitreten</CardTitle>
            <CardDescription>Treten Sie einer bestehenden Familiengruppe mit deren ID bei.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gruppen-ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Eindeutige ID der Gruppe einfügen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Beitreten...' : 'Gruppe beitreten'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
