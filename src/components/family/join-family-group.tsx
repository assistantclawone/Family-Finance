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
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const formSchema = z.object({
  groupId: z.string().min(1, { message: 'Die Gruppen-ID darf nicht leer sein.' }),
});

export function JoinFamilyGroup() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !supabase || !isSupabaseConfigured) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein, um einer Gruppe beizutreten.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const { data: group, error } = await supabase
        .from('family_groups')
        .select('id, name, member_ids, owner_id')
        .eq('id', values.groupId)
        .single();

      if (error || !group) {
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: 'Gruppe nicht gefunden. Überprüfen Sie die ID.',
        });
        return;
      }

      const memberIds: string[] = group.member_ids ?? [];
      if (memberIds.includes(user.id)) {
        toast({
          title: 'Bereits Mitglied',
          description: 'Sie sind bereits Mitglied in dieser Gruppe.',
        });
        return;
      }

      // Nur der Eigentümer kann die Mitgliederliste per RLS ändern.
      // Daher: DB-Update nur, wenn der aktuelle Nutzer der Besitzer ist.
      if (group.owner_id === user.id) {
        const { error: updErr } = await supabase
          .from('family_groups')
          .update({ member_ids: [...memberIds, user.id] })
          .eq('id', group.id);
        if (updErr) throw updErr;
        toast({
          title: 'Erfolgreich beigetreten!',
          description: `Sie sind nun Mitglied der Gruppe "${group.name}".`,
        });
      } else {
        toast({
          title: 'Beitritt nur über den Eigentümer',
          description: `Bitte bitten Sie den Eigentümer der Gruppe "${group.name}", Sie hinzuzufügen.`,
        });
      }
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
