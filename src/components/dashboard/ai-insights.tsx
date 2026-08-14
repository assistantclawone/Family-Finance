'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { Sparkles, Bot, BrainCircuit, Languages } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchAssets, fetchTransactions } from '@/lib/supabase/data';
import type { Asset, Transaction } from '@/lib/types';
import { useRegion } from '@/contexts/region-context';

export function AiInsights() {
    const { locale, currency } = useRegion();
    const { user } = useUser();
    const [overview, setOverview] = useState("");
    const [recommendation, setRecommendation] = useState<{ recommendedModel: string; reasoning: string } | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
    const [language, setLanguage] = useState<'german' | 'english'>('german');

    const fmt = (value: number) =>
        new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

    const handleGenerateOverview = async () => {
        setIsLoadingOverview(true);
        setOverview("");
        if (!user || !isSupabaseConfigured) {
            setOverview(
                language === 'english'
                    ? 'You are not signed in, so no data is available yet. Please sign in to view an overview.'
                    : 'Sie sind nicht angemeldet, daher liegen noch keine Daten vor. Melden Sie sich an, um eine Übersicht zu erhalten.'
            );
            setIsLoadingOverview(false);
            return;
        }
        try {
            const [assets, transactions] = await Promise.all([fetchAssets(), fetchTransactions()]);
            const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
            const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const net = income - expenses;
            setOverview(
                language === 'english'
                    ? `Your current assets total ${fmt(totalAssets)}. With monthly income of ${fmt(income)} and expenses of ${fmt(expenses)}, your savings amount to about ${fmt(net)} per month.`
                    : `Ihre aktuellen Vermögenswerte betragen insgesamt ${fmt(totalAssets)}. Bei monatlichen Einnahmen von ${fmt(income)} und Ausgaben von ${fmt(expenses)} sparen Sie rund ${fmt(net)} pro Monat.`
            );
        } catch {
            setOverview(language === 'english'
                ? 'The data could not be loaded.'
                : 'Die Daten konnten nicht geladen werden.');
        } finally {
            setIsLoadingOverview(false);
        }
    };
    
    const handleGetRecommendation = async () => {
        setIsLoadingRecommendation(true);
        setRecommendation(null);
        if (!user || !isSupabaseConfigured) {
            setRecommendation(
                language === 'english'
                    ? { recommendedModel: '—', reasoning: 'Please sign in to get a forecast model recommendation.' }
                    : { recommendedModel: '—', reasoning: 'Melden Sie sich an, um eine Prognosemodell-Empfehlung zu erhalten.' }
            );
            setIsLoadingRecommendation(false);
            return;
        }
        try {
            const transactions = await fetchTransactions();
            const expenses = transactions.filter((t) => t.type === 'expense').map((t) => t.amount);
            const avg = expenses.length
                ? expenses.reduce((a, b) => a + b, 0) / expenses.length
                : 0;
            const recommendedModel = language === 'english' ? 'Linear Regression' : 'Lineare Regression';
            const reasoning = language === 'english'
                ? `Based on your ${expenses.length} recorded expenses (average ${fmt(avg)} per entry), a simple Linear Regression projection is transparent and sufficiently accurate for planning purposes.`
                : `Basierend auf Ihren ${expenses.length} erfassten Ausgaben (durchschnittlich ${fmt(avg)} pro Eintrag) ist eine einfache lineare Regression transparent und für die Planung ausreichend genau.`;
            setRecommendation({ recommendedModel, reasoning });
        } catch {
            setRecommendation(
                language === 'english'
                    ? { recommendedModel: '—', reasoning: 'The data could not be loaded.' }
                    : { recommendedModel: '—', reasoning: 'Die Daten konnten nicht geladen werden.' }
            );
        } finally {
            setIsLoadingRecommendation(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent-foreground" /> KI-Einblicke</CardTitle>
                        <CardDescription>Lassen Sie die KI Ihre Finanzdaten analysieren und erhalten Sie wertvolle Einblicke.</CardDescription>
                    </div>
                     <div className="w-40">
                        <Label htmlFor="language-select" className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Languages className="h-3 w-3" /> Sprache</Label>
                        <Select value={language} onValueChange={(value: 'german' | 'english') => setLanguage(value)}>
                            <SelectTrigger id="language-select" className="h-8">
                                <SelectValue placeholder="Sprache wählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="german">Deutsch</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview"><Bot className="mr-2 h-4 w-4" /> KI-Übersicht</TabsTrigger>
                        <TabsTrigger value="model"><BrainCircuit className="mr-2 h-4 w-4" /> Modell-Empfehlung</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4 min-h-[160px]">
                        <div className="space-y-4">
                             {isLoadingOverview ? (
                                <div className="space-y-2 pt-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ) : overview ? (
                                <p className="text-sm text-muted-foreground">{overview}</p>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground py-8">
                                    <p>Klicken Sie, um eine monatliche Übersicht zu generieren.</p>
                                </div>
                            )}
                            <Button onClick={handleGenerateOverview} disabled={isLoadingOverview} className="w-full">
                                {isLoadingOverview ? 'Wird generiert...' : 'Monatsübersicht generieren'}
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="model" className="mt-4 min-h-[160px]">
                        <div className="space-y-4">
                            {isLoadingRecommendation ? (
                                <div className="space-y-2 pt-2">
                                     <Skeleton className="h-4 w-1/3" />
                                     <Skeleton className="h-4 w-full mt-2" />
                                     <Skeleton className="h-4 w-full" />
                                </div>
                            ) : recommendation ? (
                                <div>
                                    <h4 className="font-semibold">{language === 'german' ? 'Empfohlenes Modell:' : 'Recommended Model:'} {recommendation.recommendedModel}</h4>
                                    <p className="text-sm text-muted-foreground mt-2">{recommendation.reasoning}</p>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground py-8">
                                    <p>Klicken Sie, um das beste Prognosemodell zu ermitteln.</p>
                                </div>
                            )}
                             <Button onClick={handleGetRecommendation} disabled={isLoadingRecommendation} className="w-full">
                                {isLoadingRecommendation ? 'Wird analysiert...' : 'Empfehlung erhalten'}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
