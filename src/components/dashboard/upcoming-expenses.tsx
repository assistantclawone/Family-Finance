'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDataForRegion } from '@/lib/data';
import { Pencil, BadgeEuro } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { useRegion } from '@/contexts/region-context';
import { useState } from 'react';
import { AddTransactionDialog } from '../finances/add-transaction-dialog';

function ExpenseRow({ expense, onEdit }: { expense: Transaction, onEdit: (expense: Transaction) => void }) {
    const { locale } = useRegion();
    const isPending = expense.status === 'pending';
    const isEstimate = expense.isEstimate;
    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{expense.description}</div>
                <div className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
            </TableCell>
            <TableCell>
                <Badge variant={isEstimate ? 'accent' : 'secondary'}>
                    {isEstimate ? 'Schätzung' : 'Fixbetrag'}
                </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">
                {new Intl.NumberFormat(locale, { style: 'currency', currency: expense.currency }).format(expense.amount)}
            </TableCell>
            <TableCell className="text-center">
                 {isPending ? (
                    <Badge variant="accent" className="text-accent-foreground">Ausstehend</Badge>
                ) : (
                    <Badge variant="secondary" className="text-green-600 dark:text-green-400 border-green-500/50">Bestätigt</Badge>
                )}
            </TableCell>
            <TableCell className="text-right space-x-2">
                 <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <BadgeEuro className="h-4 w-4 mr-1" />
                    {expense.currency}
                </Button>
                {isPending && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(expense)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Anpassen
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
}

export function UpcomingExpenses() {
  const { region } = useRegion();
  const { recurringExpenses } = getDataForRegion(region);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);

  const handleEdit = (expense: Transaction) => {
    setSelectedTransaction(expense);
    setIsDialogOpen(true);
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedTransaction(undefined);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Anstehende Fixkosten</CardTitle>
          <CardDescription>Bestätigen Sie Ihre wiederkehrenden Ausgaben für diesen Monat, um die Prognose zu verfeinern.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beschreibung</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringExpenses.map((expense) => <ExpenseRow key={expense.id} expense={expense} onEdit={handleEdit} />)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddTransactionDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose} 
        transaction={selectedTransaction} 
    />
    </>
  );
}
