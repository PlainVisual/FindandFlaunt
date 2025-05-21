import { z } from "zod";

export const SearchFormSchema = z.object({
  clothingItem: z.string().min(2, { message: "Clothing item must be at least 2 characters." }).max(50, { message: "Clothing item must be 50 characters or less."}),
  colorPreference: z.string().min(2, { message: "Color preference must be at least 2 characters." }).max(30, { message: "Color preference must be 30 characters or less."}),
  // searchResultsHtml field is removed as per scraping requirement
});

export type SearchFormValues = z.infer<typeof SearchFormSchema>;

// Product type previously inferred from RelevantProductSchema in shoeby-scraper.ts
// is now aligned with how RelevantProductSchema is defined and used for AI flows.
// If a distinct 'Product' type for client-side or general use is needed, it can be defined here.
// For now, components will use the type inferred from RelevantProductSchema where appropriate.
