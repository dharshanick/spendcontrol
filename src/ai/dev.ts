import { config } from 'dotenv';
config();

if (process.env.GENKIT_ENV === 'development') {
    require('@/ai/flows/ai-spending-insights.ts');
}
