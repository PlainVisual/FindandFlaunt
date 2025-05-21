// use server'

/**
 * @fileOverview Analyzes search results from Shoeby.nl based on user input to filter clothing options.
 *
 * - analyzeSearchResults - A function that handles the analysis of search results.
 * - AnalyzeSearchResultsInput - The input type for the analyzeSearchResults function.
 * - AnalyzeSearchResultsOutput - The return type for the analyzeSearchResults function.
 * - RelevantProductSchema - The Zod schema for a relevant product.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSearchResultsInputSchema = z.object({
  clothingItem: z.string().describe('The type of clothing item to search for (e.g., blouse, dress).'),
  colorPreference: z.string().describe('The preferred color for the clothing item.'),
  searchResults: z.string().describe('The HTML content of the search results page from Shoeby.nl.'),
});
export type AnalyzeSearchResultsInput = z.infer<typeof AnalyzeSearchResultsInputSchema>;

export const RelevantProductSchema = z.object({
  imageUrl: z.string().describe('URL of the product image.'),
  title: z.string().describe('Title of the product.'),
  description: z.string().describe('Short description of the product.'),
  price: z.string().describe('Price of the product.'),
  productUrl: z.string().describe('URL to the product page on Shoeby.nl.'),
  relevanceScore: z.number().describe('A numerical score (0-1) indicating how well the product matches the user preferences, with 1 being a perfect match.')
});

const AnalyzeSearchResultsOutputSchema = z.array(RelevantProductSchema).describe('A list of relevant products from the search results, filtered by color preference and relevance.');
export type AnalyzeSearchResultsOutput = z.infer<typeof AnalyzeSearchResultsOutputSchema>;

export async function analyzeSearchResults(input: AnalyzeSearchResultsInput): Promise<AnalyzeSearchResultsOutput> {
  return analyzeSearchResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSearchResultsPrompt',
  input: {schema: AnalyzeSearchResultsInputSchema},
  output: {schema: AnalyzeSearchResultsOutputSchema},
  prompt: `You are a personal style advisor. Analyze the following search results from Shoeby.nl for a specific clothing item and color preference. Filter the results to identify the most relevant matches based on the user's input.

Clothing Item: {{{clothingItem}}}
Color Preference: {{{colorPreference}}}
Search Results:
{{#if searchResults}}
  {{{searchResults}}}
{{else}}
  No search results provided.
{{/if}}

Return a JSON array of relevant products, each including the image URL, title, description, price and product URL. Also include a relevance score (0-1) indicating how well the product matches the user preferences.
`,
});

const analyzeSearchResultsFlow = ai.defineFlow(
  {
    name: 'analyzeSearchResultsFlow',
    inputSchema: AnalyzeSearchResultsInputSchema,
    outputSchema: AnalyzeSearchResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

