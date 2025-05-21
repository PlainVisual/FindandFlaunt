// use server'

/**
 * @fileOverview Analyzes search results HTML provided by the user to filter clothing options.
 *
 * - analyzeSearchResults - A function that handles the analysis of search results.
 * - AnalyzeSearchResults_FlowInput - The input type for the analyzeSearchResults function.
 * - AnalyzeSearchResultsOutput - The return type for the analyzeSearchResults function.
 * - RelevantProductSchema - The Zod schema for a relevant product.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// scrapeShoebySearchResults is no longer used.

export const AnalyzeSearchResults_FlowInputSchema = z.object({
  clothingItem: z.string().describe('The type of clothing item to search for (e.g., blouse, dress).'),
  colorPreference: z.string().describe('The preferred color for the clothing item.'),
  searchResultsHtml: z.string().describe('The HTML content of the search results page from Shoeby.nl provided by the user.'),
});
export type AnalyzeSearchResults_FlowInput = z.infer<typeof AnalyzeSearchResults_FlowInputSchema>;

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

export async function analyzeSearchResults(input: AnalyzeSearchResults_FlowInput): Promise<AnalyzeSearchResultsOutput> {
  return analyzeSearchResultsFlow(input);
}

// PromptInputSchema is no longer needed as AnalyzeSearchResults_FlowInputSchema is used directly.

const prompt = ai.definePrompt({
  name: 'analyzeSearchResultsPrompt',
  input: {schema: AnalyzeSearchResults_FlowInputSchema}, // Use the flow input schema directly
  output: {schema: AnalyzeSearchResultsOutputSchema},
  prompt: `You are a personal style advisor. Analyze the following HTML search results from Shoeby.nl for a specific clothing item and color preference. Filter the results to identify the most relevant matches based on the user's input.

Clothing Item: {{{clothingItem}}}
Color Preference: {{{colorPreference}}}

Search Results HTML:
{{#if searchResultsHtml}}
  {{{searchResultsHtml}}}
{{else}}
  No search results HTML provided. Please indicate that no products could be found due to missing HTML content.
{{/if}}

Return a JSON array of relevant products, each including the image URL, title, description, price, and product URL. Also include a relevance score (0-1) indicating how well the product matches the user preferences. If no products are found in the HTML or the HTML is empty/invalid, return an empty array.
`,
});

const analyzeSearchResultsFlow = ai.defineFlow(
  {
    name: 'analyzeSearchResultsFlow',
    inputSchema: AnalyzeSearchResults_FlowInputSchema,
    outputSchema: AnalyzeSearchResultsOutputSchema,
  },
  async (flowInput) => {
    // The flowInput now contains clothingItem, colorPreference, and searchResultsHtml.
    // No need to call scrapeShoebySearchResults.

    if (!flowInput.searchResultsHtml) {
      console.warn(`No searchResultsHtml provided for ${flowInput.clothingItem} - ${flowInput.colorPreference}. Proceeding with empty HTML for prompt.`);
    }
    
    // Pass the flowInput directly to the prompt
    const {output} = await prompt(flowInput);

    // Ensure output is always an array, even if prompt returns null/undefined
    return output || [];
  }
);
