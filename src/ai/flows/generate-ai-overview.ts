'use server';

/**
 * @fileOverview AI-powered financial overview generator.
 *
 * - generateAIOverview - A function that generates a comprehensive financial overview.
 * - GenerateAIOverviewInput - The input type for the generateAIOverview function.
 * - GenerateAIOverviewOutput - The return type for the generateAIOverview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAIOverviewInputSchema = z.object({
  timePeriod: z.enum(['weekly', 'monthly', 'yearly']).describe('The time period for the overview.'),
  financialData: z.string().describe('A summary of the user financial data, including income, expenses, and assets.'),
  forecastData: z.string().describe('A summary of the forecast data.'),
  historicalData: z.string().describe('A summary of the historical data.'),
  language: z.enum(['german', 'english']).describe('The language for the generated overview.'),
});
export type GenerateAIOverviewInput = z.infer<typeof GenerateAIOverviewInputSchema>;

const GenerateAIOverviewOutputSchema = z.object({
  overview: z.string().describe('A comprehensive AI-generated financial overview.'),
});
export type GenerateAIOverviewOutput = z.infer<typeof GenerateAIOverviewOutputSchema>;

export async function generateAIOverview(input: GenerateAIOverviewInput): Promise<GenerateAIOverviewOutput> {
  return generateAIOverviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAIOverviewPrompt',
  input: {schema: GenerateAIOverviewInputSchema},
  output: {schema: GenerateAIOverviewOutputSchema},
  prompt: `You are a financial advisor providing a comprehensive overview of a user's finances in {{language}}.

  Based on the provided financial, forecast, and historical data, generate a {{timePeriod}} overview that summarizes key insights, compares forecasts with real data, and provides actionable recommendations.

  Financial Data: {{{financialData}}}
  Forecast Data: {{{forecastData}}}
  Historical Data: {{{historicalData}}}
  `,
});

const generateAIOverviewFlow = ai.defineFlow(
  {
    name: 'generateAIOverviewFlow',
    inputSchema: GenerateAIOverviewInputSchema,
    outputSchema: GenerateAIOverviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
