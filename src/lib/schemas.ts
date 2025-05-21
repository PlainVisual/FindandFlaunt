import { z } from "zod";

export const SearchFormSchema = z.object({
  clothingItem: z.string().min(2, { message: "Clothing item must be at least 2 characters." }).max(50, { message: "Clothing item must be 50 characters or less."}),
  colorPreference: z.string().min(2, { message: "Color preference must be at least 2 characters." }).max(30, { message: "Color preference must be 30 characters or less."}),
  searchResultsHtml: z.string().min(100, { message: "HTML content must be provided and seems too short." }).describe("The HTML content of the search results page from Shoeby.nl."),
});

export type SearchFormValues = z.infer<typeof SearchFormSchema>;
