'use server';

/**
 * @fileOverview An AI agent that provides insights into user spending habits.
 *
 * - getSpendingInsights - A function that analyzes spending data and provides personalized insights.
 * - SpendingInsightsInput - The input type for the getSpendingInsights function.
 * - SpendingInsightsOutput - The return type for the getSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpendingInsightsInputSchema = z.object({
  transactions: z.array(
    z.object({
      category: z.string().describe('The category of the transaction (e.g., Food, Transportation, Entertainment).'),
      amount: z.number().describe('The amount of the transaction.'),
      date: z.string().describe('The date of the transaction in ISO format (YYYY-MM-DD).'),
      description: z.string().optional().describe('A description of the transaction.'),
    })
  ).describe('An array of transaction objects, each containing category, amount, and date.'),
  totalBalance: z.number().describe('The user current total balance.'),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  insights: z.array(
    z.string().describe('An array of personalized insights based on the user spending habits.')
  ).describe('Personalized insights into spending habits.'),
});
export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {schema: SpendingInsightsInputSchema},
  output: {schema: SpendingInsightsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's spending habits and provide personalized insights and suggestions to reduce expenses.

    Transactions:
    {{#each transactions}}
    - Date: {{date}}, Category: {{category}}, Amount: {{amount}}{{#if description}}, Description: {{description}}{{/if}}
    {{/each}}

    Total Balance: {{totalBalance}}

    Provide insights such as identifying categories where the user is overspending, suggesting ways to reduce expenses, and highlighting any unusual spending patterns.  The response should be an array of strings.
    `,
});

const spendingInsightsFlow = ai.defineFlow(
  {
    name: 'spendingInsightsFlow',
    inputSchema: SpendingInsightsInputSchema,
    outputSchema: SpendingInsightsOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (e) {
        // Genkit may not be running, provide a default response
        return { insights: ["AI insights are currently unavailable. Please ensure the Genkit server is running or try again later."] };
    }
  }
);


export async function getSpendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}
