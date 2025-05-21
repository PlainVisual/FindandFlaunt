
// @/app/actions.ts
"use server";

import { analyzeSearchResults, type AnalyzeSearchResults_FlowInput, type AnalyzeSearchResultsOutput } from "@/ai/flows/analyze-search-results";
import { provideStylingAdvice, type ProvideStylingAdviceInput, type ProvideStylingAdviceOutput } from "@/ai/flows/provide-styling-advice";
import { RelevantProductSchema } from '@/lib/schemas';
import { z } from "zod";

// Helper to validate results from AI flow for analyzeSearchResults
const SafeAnalyzeSearchResultsOutputSchema = z.array(RelevantProductSchema.partial().extend({
  relevanceScore: z.number().min(0).max(1).default(0.5),
  imageUrl: z.string().url().optional().or(z.literal("")),
  title: z.string().default("Untitled Product"),
  description: z.string().default("No description available."),
  price: z.string().default("Price not specified"),
  productUrl: z.string().url().optional().or(z.literal("")),
}));


export async function performSearch(input: AnalyzeSearchResults_FlowInput): Promise<AnalyzeSearchResultsOutput | { error: string }> {
  try {
    if (!input.clothingItem) {
      return { error: "Clothing Item is required." };
    }

    const results = await analyzeSearchResults(input);

    // If the flow itself fails to return an array (e.g., returns null/undefined unexpectedly)
    if (!Array.isArray(results)) {
        console.error("analyzeSearchResults did not return an array. Received:", results);
        return { error: "Failed to analyze search results: The AI service returned an unexpected data structure. Please check service status or try again."};
    }

    const validatedResults = SafeAnalyzeSearchResultsOutputSchema.safeParse(results);

    if (!validatedResults.success) {
      console.error("Validation failed for analyzeSearchResults:", validatedResults.error.issues);
      const issueMessages = validatedResults.error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join('; ');
      return { error: `Received malformed product data from AI. Details: ${issueMessages}. Please try again.` };
    }

    const displayableResults = validatedResults.data.filter(
        product => product.imageUrl && product.productUrl && product.title !== "Untitled Product"
    );

    if (displayableResults.length === 0) {
        if (results.length > 0) { // Products were found but filtered out due to missing essential details
            return { error: "Products found by AI were missing essential details (like image or link) or did not meet display criteria. The scraping might have been incomplete or the AI's extraction was partial." };
        }
        // This message is shown if scraping fails (results=[]) or no relevant products are found by the AI.
        return { error: "No relevant products found after searching Shoeby.nl. This could be due to the item not being available, a temporary issue with accessing Shoeby.nl, or the AI not finding matches in the content. Please try different keywords or check back later." };
    }
    return displayableResults as AnalyzeSearchResultsOutput;
  } catch (e) {
    console.error("Error in performSearch:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    // This message covers errors from the Genkit call itself (e.g. API errors from Google AI, flow execution errors)
    return { error: `An error occurred while trying to fetch or analyze search results: ${errorMessage}. Please ensure your AI service is configured correctly, check logs, and try again.` };
  }
}

export async function getStylingAdvice(input: ProvideStylingAdviceInput): Promise<ProvideStylingAdviceOutput | { error: string }> {
  try {
    if (!input.clothingItem || !input.colorPreference || !input.itemDescription || !input.itemImageUrl) {
        return { error: "All product details (clothing item, color, description, image URL) are required for styling advice." };
    }
     if (!input.itemImageUrl.startsWith('http://') && !input.itemImageUrl.startsWith('https://') && !input.itemImageUrl.startsWith('data:')) {
        return { error: "Invalid item image URL provided for styling advice. It must start with http://, https://, or data:." };
    }

    const advice = await provideStylingAdvice(input);
     if (!advice || !advice.stylingAdvice || !advice.outfitImageUrl) {
        return { error: "Could not generate styling advice for this item. The AI might be unable to process the request or returned incomplete data." };
    }
    if (!advice.outfitImageUrl.startsWith('data:image/') && !advice.outfitImageUrl.startsWith('http')) {
        return { error: "AI generated an invalid outfit image URL. It should be a data URI or a web URL." };
    }
    return advice;
  } catch (e) {
    console.error("Error in getStylingAdvice:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    return { error: `Failed to generate styling advice: ${errorMessage}. Please check AI service logs and try again.` };
  }
}
