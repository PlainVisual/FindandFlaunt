import { z } from "zod";

export const SearchFormSchema = z.object({
  clothingItem: z.string().min(2, { message: "Clothing item must be at least 2 characters." }).max(50, { message: "Clothing item must be 50 characters or less."}),
  colorPreference: z.string().min(2, { message: "Color preference must be at least 2 characters." }).max(30, { message: "Color preference must be 30 characters or less."}).or(z.literal("")).optional(),
});

export type SearchFormValues = z.infer<typeof SearchFormSchema>;

export const RelevantProductSchema = z.object({
  imageUrl: z.string().optional().describe('URL of the product image. Should be a valid URL if provided, otherwise can be omitted.'),
  title: z.string().describe('Title of the product.'),
  description: z.string().describe('Short description of the product.'),
  price: z.string().describe('Price of the product.'),
  productUrl: z.string().optional().describe('URL to the product page on Shoeby.nl. Should be a valid URL if provided, otherwise can be omitted.'),
  relevanceScore: z.number().describe('A numerical score (0-1) indicating how well the product matches the user preferences, with 1 being a perfect match.')
});
export type RelevantProduct = z.infer<typeof RelevantProductSchema>;