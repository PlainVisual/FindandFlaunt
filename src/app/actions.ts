
// @/app/actions.ts
"use server";

import { analyzeSearchResults, type AnalyzeSearchResults_FlowInput, type AnalyzeSearchResultsOutput } from "@/ai/flows/analyze-search-results";
import { provideStylingAdvice, type ProvideStylingAdviceInput, type ProvideStylingAdviceOutput } from "@/ai/flows/provide-styling-advice";
import { RelevantProductSchema } from '@/lib/schemas';
import { z } from "zod";

// Custom Zod schema to safely parse a string as a URL.
// If it's a valid URL, it's returned. Otherwise, it's treated as an empty string.
// It also defaults to an empty string if undefined.
const SafeUrlStringSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    // Trim whitespace which can invalidate URLs
    return val.trim();
  }
  return val; // Pass other types (like undefined) through for further Zod processing
}, z.string().transform((val) => {
    if (val === "") return ""; // Allow explicitly empty string
    const urlCheck = z.string().url().safeParse(val);
    return urlCheck.success ? urlCheck.data : ""; // If not a valid URL, coerce to empty string
  }).optional().default("")
);


// Helper to validate results from AI flow for analyzeSearchResults
const SafeAnalyzeSearchResultsOutputSchema = z.array(
  RelevantProductSchema.partial().extend({
    relevanceScore: z.number().min(0).max(1).optional().default(0.5), // Made optional before default
    imageUrl: SafeUrlStringSchema,
    title: z.string().optional().default("Untitled Product"), // Made optional before default
    description: z.string().optional().default("No description available."), // Made optional before default
    price: z.string().optional().default("Price not specified"), // Made optional before default
    productUrl: SafeUrlStringSchema,
  })
);


export async function performSearch(input: AnalyzeSearchResults_FlowInput): Promise<AnalyzeSearchResultsOutput | { error: string }> {
  try {
    if (!input.clothingItem) {
      return { error: "Clothing Item is required." };
    }

    const results = await analyzeSearchResults(input);

    if (!Array.isArray(results)) {
        console.error("analyzeSearchResults did not return an array. Received:", results);
        return { error: "Failed to analyze search results: The AI service returned an unexpected data structure. Please check service status or try again."};
    }

    const validatedResults = SafeAnalyzeSearchResultsOutputSchema.safeParse(results);

    if (!validatedResults.success) {
      console.error("Validation failed for analyzeSearchResults. Issues:", validatedResults.error.issues);
      console.error("Raw AI results causing validation failure:", JSON.stringify(results, null, 2)); // Added for detailed logging
      const issueMessages = validatedResults.error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join('; ');
      return { error: `Received malformed product data from AI. Details: ${issueMessages}. Please try again.` };
    }
    
    // Filter out products that don't have essential displayable information after parsing & defaulting
    const displayableResults = validatedResults.data.filter(
        product => product.imageUrl && product.productUrl && product.title !== "Untitled Product"
    );

    if (displayableResults.length === 0) {
        // This condition means either AI found nothing, or what it found was unusable (e.g. no valid URLs after parsing)
        let specificMessage = "No relevant products found after searching Shoeby.nl and processing the results.";
        if (results.length > 0 && validatedResults.data.length > 0) {
            // AI found items, but they didn't meet display criteria (e.g., missing URL/image after our safe parsing)
            specificMessage = "Products found by AI were missing essential details (like image or link) or did not meet display criteria after processing. The scraping might have been incomplete or the AI's extraction was partial.";
        } else if (results.length === 0) {
            // AI itself returned an empty list
            specificMessage = "No products were identified by the AI from the Shoeby.nl search results. The item might not be available, or there could be a temporary issue accessing Shoeby.nl.";
        }
        return { error: specificMessage };
    }
    // Cast is safe here because displayableResults are filtered to have required fields.
    // And SafeAnalyzeSearchResultsOutputSchema ensures other fields match RelevantProduct or have defaults.
    return displayableResults as AnalyzeSearchResultsOutput;

  } catch (e) {
    console.error("Error in performSearch:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
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
