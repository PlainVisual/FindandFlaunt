'use server';

/**
 * @fileOverview Analyzes search results HTML scraped from Shoeby.nl to filter clothing options.
 *
 * - analyzeSearchResults - A function that handles the analysis of search results.
 * - AnalyzeSearchResults_FlowInput - The input type for the analyzeSearchResults function.
 * - AnalyzeSearchResultsOutput - The return type for the analyzeSearchResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { scrapeShoebySearchResults } from '@/services/shoeby-scraper';
import { RelevantProductSchema } from '@/lib/schemas';

const AnalyzeSearchResults_FlowInputSchema = z.object({
  clothingItem: z.string().describe('The type of clothing item to search for (e.g., blouse, dress).'),
  colorPreference: z.string().optional().describe('The preferred color for the clothing item. Can be empty if no preference.'),
});
export type AnalyzeSearchResults_FlowInput = z.infer<typeof AnalyzeSearchResults_FlowInputSchema>;

const AnalyzeSearchResultsOutputSchema = z.array(RelevantProductSchema).describe('A list of relevant products from the search results, filtered by color preference and relevance.');
export type AnalyzeSearchResultsOutput = z.infer<typeof AnalyzeSearchResultsOutputSchema>;

export async function analyzeSearchResults(input: AnalyzeSearchResults_FlowInput): Promise<AnalyzeSearchResultsOutput> {
  return analyzeSearchResultsFlow(input);
}

// This internal type is for the prompt, which will include the fetched HTML
const PromptInputSchema = AnalyzeSearchResults_FlowInputSchema.extend({
  searchResultsHtml: z.string().optional().describe('The HTML content of the search results page from Shoeby.nl, fetched by the system.'),
});
type PromptInput = z.infer<typeof PromptInputSchema>;


const prompt = ai.definePrompt({
  name: 'analyzeSearchResultsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzeSearchResultsOutputSchema},
  prompt: `You are a personal style advisor. Analyze the following HTML search results from Shoeby.nl for a specific clothing item and color preference. Filter the results to identify the most relevant matches based on the user's input.

Clothing Item: {{{clothingItem}}}
Color Preference: {{#if colorPreference}}{{{colorPreference}}}{{else}}Any color{{/if}}

Search Results HTML:
{{#if searchResultsHtml}}
  {{{searchResultsHtml}}}
{{else}}
  No search results HTML was available or could be fetched. Please indicate that no products could be found.
{{/if}}

Return a JSON array of relevant products, each including the image URL, title, description, price, and product URL. Also include a relevance score (0-1) indicating how well the product matches the user preferences. If no products are found in the HTML or the HTML is empty/invalid, return an empty array.
If the color preference is not strictly met by a product, but the item is a good match otherwise, you can still include it but assign a lower relevance score. If color preference is empty or "any", do not penalize for color.
`,
});

const analyzeSearchResultsFlow = ai.defineFlow(
  {
    name: 'analyzeSearchResultsFlow',
    inputSchema: AnalyzeSearchResults_FlowInputSchema,
    outputSchema: AnalyzeSearchResultsOutputSchema,
  },
  async (flowInput) => {
    const htmlContent = await scrapeShoebySearchResults(flowInput.clothingItem, flowInput.colorPreference || "");

    if (!htmlContent) {
      console.warn(`Failed to scrape HTML for ${flowInput.clothingItem} - ${flowInput.colorPreference}. Proceeding with empty HTML for prompt.`);
    }
    
    const promptData: PromptInput = {
      ...flowInput,
      searchResultsHtml: htmlContent || undefined, 
    };
    
    const {output} = await prompt(promptData);
    return output || [];
  }
);
