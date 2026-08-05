'use server';

/**
 * @fileOverview Generates a future financial forecast based on user data.
 *
 * - generateFutureForecast - A function that generates the forecast.
 * - FutureForecastInput - The input type for the generateFutureForecast function.
 * - FutureForecastOutput - The return type for the generateFutureForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FutureForecastInputSchema = z.object({
  historicalData: z
    .string()
    .describe('Historical financial data, including income and expenses.'),
  currentAssets: z.string().describe('Current financial assets (e.g., bank accounts, portfolios).'),
  plannedExpenses: z.string().describe('Planned future expenses.'),
});
export type FutureForecastInput = z.infer<typeof FutureForecastInputSchema>;

const FutureForecastOutputSchema = z.object({
  totalAssetForecast: z.string().describe('A forecast of total assets over time.'),
  incomeForecast: z.string().describe('A detailed income forecast (fixed, variable, and notable).'),
  expenseForecast: z.string().describe('A detailed expense forecast (fixed, variable, and notable).'),
  cashFlowStatement: z.string().describe('Cash flow statement including projections.'),
  statistics: z.string().describe('Relevant financial statistics and metrics.'),
  modelRecommendation: z.string().describe('AI recommendation for the best-performing model.'),
});
export type FutureForecastOutput = z.infer<typeof FutureForecastOutputSchema>;

export async function generateFutureForecast(
  input: FutureForecastInput
): Promise<FutureForecastOutput> {
  return generateFutureForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'futureForecastPrompt',
  input: {schema: FutureForecastInputSchema},
  output: {schema: FutureForecastOutputSchema},
  prompt: `You are a financial forecasting expert. Based on the historical data, current assets, and planned expenses provided, generate a comprehensive financial forecast.

Historical Data: {{{historicalData}}}
Current Assets: {{{currentAssets}}}
Planned Expenses: {{{plannedExpenses}}}

Provide the forecast including:
- Total Asset Forecast: A clear projection of total assets over time.
- Income Forecast: A detailed breakdown of income projections (fixed, variable, and notable).
- Expense Forecast: A detailed breakdown of expense projections (fixed, variable, and notable).
- Cash Flow Statement: A projected cash flow statement.
- Statistics: Relevant financial statistics and metrics.
- Model Recommendation: Based on the data provided, recommend the best-performing mathematical model for this user's forecasting needs. Explain your reasoning.

Ensure the forecast is clear, concise, and actionable.

Output in the requested JSON Schema format. Use descriptive language and avoid technical jargon.
`,
});

const generateFutureForecastFlow = ai.defineFlow(
  {
    name: 'generateFutureForecastFlow',
    inputSchema: FutureForecastInputSchema,
    outputSchema: FutureForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
