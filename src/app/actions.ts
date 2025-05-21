// @/app/actions.ts
"use server";

import { analyzeSearchResults, type AnalyzeSearchResults_FlowInput, type AnalyzeSearchResultsOutput, RelevantProductSchema } from "@/ai/flows/analyze-search-results";
import { provideStylingAdvice, type ProvideStylingAdviceInput, type ProvideStylingAdviceOutput } from "@/ai/flows/provide-styling-advice";
import { z } from "zod";

// Helper to validate results from AI flow for analyzeSearchResults
const SafeAnalyzeSearchResultsOutputSchema = z.array(RelevantProductSchema.partial().extend({
  relevanceScore: z.number().min(0).max(1).default(0.5), // Ensure score is always present
  imageUrl: z.string().url().optional().or(z.literal("")), // Allow empty string or valid URL
  title: z.string().default("Untitled Product"),
  description: z.string().default("No description available."),
  price: z.string().default("Price not specified"),
  productUrl: z.string().url().optional().or(z.literal("")),
}));


export async function performSearch(input: AnalyzeSearchResults_FlowInput): Promise<AnalyzeSearchResultsOutput | { error: string }> {
  try {
    // Validate all required inputs for the new schema
    if (!input.clothingItem || !input.colorPreference || !input.searchResultsHtml) {
      return { error: "Clothing Item, Color Preference, and Search Results HTML are required." };
    }
    if (input.searchResultsHtml.length < 100) { // Basic check for HTML content length
        return { error: "The provided HTML content for search results seems too short. Please ensure you copied the full page source." };
    }


    const results = await analyzeSearchResults(input);
    
    if (!results) {
        console.error("analyzeSearchResults returned null or undefined, expected an array.");
        return { error: "Failed to analyze search results: AI did not return expected data format."};
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
        if (results.length > 0) { 
            return { error: "Products found by AI were missing essential details (like image or link) or did not meet display criteria. Please check the HTML source or try a different search." };
        }
        return { error: "No relevant products found in the provided HTML. Please ensure the HTML is correct and contains product listings." };
    }
    return displayableResults as AnalyzeSearchResultsOutput; 
  } catch (e) {
    console.error("Error in performSearch:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    return { error: `Failed to analyze search results: ${errorMessage}. Please try again.` };
  }
}

export async function getStylingAdvice(input: ProvideStylingAdviceInput): Promise<ProvideStylingAdviceOutput | { error: string }> {
  try {
    if (!input.clothingItem || !input.colorPreference || !input.itemDescription || !input.itemImageUrl) {
        return { error: "All product details (clothing item, color, description, image URL) are required for styling advice." };
    }
     if (!input.itemImageUrl.startsWith('http://') && !input.itemImageUrl.startsWith('https://')) {
        return { error: "Invalid item image URL provided for styling advice. It must start with http:// or https://." };
    }


    const advice = await provideStylingAdvice(input);
     if (!advice || !advice.stylingAdvice || !advice.outfitImageUrl) {
        return { error: "Could not generate styling advice for this item. The AI might be unable to process the request." };
    }
    if (!advice.outfitImageUrl.startsWith('data:image/') && !advice.outfitImageUrl.startsWith('http')) {
        return { error: "AI generated an invalid outfit image URL. It should be a data URI or a web URL." };
    }
    return advice;
  } catch (e) {
    console.error("Error in getStylingAdvice:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    return { error: `Failed to generate styling advice: ${errorMessage}. Please try again.` };
  }
}
