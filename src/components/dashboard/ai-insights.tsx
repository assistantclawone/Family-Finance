'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { Sparkles, Bot, BrainCircuit, Languages } from 'lucide-react';
import { useState } from 'react';
import { generateAIOverview } from '@/ai/flows/generate-ai-overview';
import { getModelRecommendation } from '@/ai/flows/get-model-recommendation';
import { Skeleton } from '../ui/skeleton';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function AiInsights() {
    const [overview, setOverview] = useState("");
    const [recommendation, setRecommendation] = useState<{ recommendedModel: string; reasoning: string } | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
    const [language, setLanguage] = useState<'german' | 'english'>('german');

    const handleGenerateOverview = async () => {
        setIsLoadingOverview(true);
        setOverview("");
        try {
            const result = await generateAIOverview({
                timePeriod: 'monthly',
                financialData: 'Current assets: €125,500. Monthly income: €6,000. Recurring expenses: €1,750.',
                forecastData: 'Forecast shows a steady asset growth of approx. €2,000 per month.',
                historicalData: 'Asset growth has been consistent over the past year.',
                language: language,
            });
            setOverview(result.overview);
        } catch (e) {
            console.error(e);
            setOverview("Fehler beim Generieren der Übersicht.");
        } finally {
            setIsLoadingOverview(false);
        }
    };
    
    const handleGetRecommendation = async () => {
        setIsLoadingRecommendation(true);
        setRecommendation(null);
        try {
            const result = await getModelRecommendation({
                historicalData: 'Consistent monthly savings of ~€2,000. No major fluctuations.',
                forecastData: 'Linear Regression model predicts €2,000/month growth. Exponential Smoothing model predicts €2,100/month growth.',
                realityData: 'Actual growth over last 3 months: €2,050, €1,980, €2,080. Average: €2,036.',
                language: language,
            });
            setRecommendation(result);
        } catch (e) {
            console.error(e);
             setRecommendation({ recommendedModel: "Fehler", reasoning: "Fehler beim Abrufen der Empfehlung." });
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
