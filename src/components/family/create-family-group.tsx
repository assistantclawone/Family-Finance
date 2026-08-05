'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Der Name muss mindestens 2 Zeichen lang sein.' }),
  description: z.string().optional(),
});

export function CreateFamilyGroup() {
  const { user } = useUser();
  const firestore = useFirestore();
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
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein, um eine Gruppe zu erstellen.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const collectionRef = collection(firestore, 'familyGroups');
      await addDocumentNonBlocking(collectionRef, {
        name: values.name,
        description: values.description,
        ownerId: user.uid,
        memberIds: [user.uid],
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Gruppe erstellt!',
        description: `Die Gruppe "${values.name}" wurde erfolgreich erstellt.`,
      });
      form.reset();
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
                    <Input placeholder="z.B. Familie Schmidt" {...field} />
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
