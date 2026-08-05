'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const formSchema = z.object({
  groupId: z.string().min(1, { message: 'Die Gruppen-ID darf nicht leer sein.' }),
});

export function JoinFamilyGroup() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein, um einer Gruppe beizutreten.',
      });
      return;
    }
    setIsLoading(true);

    const groupRef = doc(firestore, 'familyGroups', values.groupId);

    try {
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: 'Gruppe nicht gefunden. Überprüfen Sie die ID.',
        });
        setIsLoading(false);
        return;
      }
      
      const groupData = groupSnap.data();
      if(groupData.memberIds.includes(user.uid)) {
          toast({
            title: 'Bereits Mitglied',
            description: 'Sie sind bereits Mitglied in dieser Gruppe.',
          });
          setIsLoading(false);
          return;
      }

      updateDocumentNonBlocking(groupRef, {
        memberIds: arrayUnion(user.uid),
      });

      toast({
        title: 'Erfolgreich beigetreten!',
        description: `Sie sind nun Mitglied der Gruppe "${groupSnap.data().name}".`,
      });
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
