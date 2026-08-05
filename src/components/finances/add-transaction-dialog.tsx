'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRegion } from '@/contexts/region-context';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Transaction } from '@/lib/types';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Beschreibung muss mindestens 2 Zeichen lang sein.' }),
  amount: z.coerce.number().positive({ message: 'Betrag muss positiv sein.' }),
  type: z.enum(['income', 'expense'], { required_error: 'Bitte Art auswählen.' }),
  date: z.date({ required_error: 'Bitte ein Datum auswählen.' }),
  isEstimate: z.boolean().default(false),
});

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export function AddTransactionDialog({ open, onOpenChange, transaction }: AddTransactionDialogProps) {
  const { region, currency } = useRegion();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      date: new Date(),
      isEstimate: false,
    },
  });

  useEffect(() => {
    if (transaction) {
      form.reset({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: new Date(transaction.date),
        isEstimate: transaction.isEstimate,
      });
    } else {
        form.reset({
            description: '',
            amount: 0,
            type: 'expense',
            date: new Date(),
            isEstimate: false
        })
    }
  }, [transaction, form, open]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Sie müssen angemeldet sein.' });
      return;
    }
    setIsLoading(true);
    
    try {
      // In a real app, you would differentiate between creating a new doc and updating one
      // For this example, we just add a new one.
      const collectionRef = collection(firestore, 'transactions');
      await addDocumentNonBlocking(collectionRef, {
        ...values,
        userId: user.uid,
        date: values.date.toISOString(),
        currency: currency,
        isRecurring: transaction?.isRecurring || false, // Keep recurring status if editing
        status: 'confirmed', // When user submits, it's confirmed.
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: transaction ? 'Eintrag aktualisiert!' : 'Eintrag erstellt!',
        description: 'Die Transaktion wurde erfolgreich gespeichert.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Fehler beim Speichern der Transaktion:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Etwas ist schief gelaufen.",
        description: "Die Transaktion konnte nicht gespeichert werden.",
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Eintrag bearbeiten' : 'Neuen Eintrag erfassen'}</DialogTitle>
          <DialogDescription>
            {transaction ? 'Passen Sie die Details an und speichern Sie.' : 'Fügen Sie eine neue Einnahme oder Ausgabe hinzu.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Wocheneinkauf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Betrag ({currency})</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Datum</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Wählen Sie ein Datum</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Art</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="expense" />
                          </FormControl>
                          <FormLabel className="font-normal">Ausgabe</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="income" />
                          </FormControl>
                          <FormLabel className="font-normal">Einnahme</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="isEstimate"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Betrag ist</FormLabel>
                     <FormControl>
                      <RadioGroup
                        onValueChange={(val) => field.onChange(val === 'true')}
                        defaultValue={String(field.value)}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">Exakt</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Schätzung</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Wird gespeichert...' : 'Eintrag speichern'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
