// use server'

/**
 * @fileOverview Provides styling advice based on clothing items and color preferences.
 *
 * - provideStylingAdvice - A function that generates styling advice.
 * - ProvideStylingAdviceInput - The input type for the provideStylingAdvice function.
 * - ProvideStylingAdviceOutput - The return type for the provideStylingAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideStylingAdviceInputSchema = z.object({
  clothingItem: z.string().describe('The clothing item to style (e.g., blouse, dress).'),
  colorPreference: z.string().describe('The preferred color for the outfit.'),
  itemDescription: z.string().describe('The description of the clothing item.'),
  itemImageUrl: z.string().describe('URL of the clothing item image.'),
});
export type ProvideStylingAdviceInput = z.infer<typeof ProvideStylingAdviceInputSchema>;

const ProvideStylingAdviceOutputSchema = z.object({
  stylingAdvice: z.string().describe('AI-generated styling advice for the clothing item.'),
  outfitImageUrl: z.string().describe('URL of a generated image showing the styled outfit.'),
});
export type ProvideStylingAdviceOutput = z.infer<typeof ProvideStylingAdviceOutputSchema>;

export async function provideStylingAdvice(input: ProvideStylingAdviceInput): Promise<ProvideStylingAdviceOutput> {
  return provideStylingAdviceFlow(input);
}

const stylingAdvicePrompt = ai.definePrompt({
  name: 'stylingAdvicePrompt',
  input: {schema: ProvideStylingAdviceInputSchema},
  output: {schema: ProvideStylingAdviceOutputSchema},
  prompt: `You are a personal stylist. Provide styling advice for the following clothing item, considering the user's color preference.

Clothing Item: {{{clothingItem}}}
Color Preference: {{{colorPreference}}}
Description: {{{itemDescription}}}

Give detailed advice on how to style this item, including what other items to pair it with and for what occasions. Also, tell me what kind of jewelry, shoes, bags and other accessories might be used to improve or complete the outfit.

Based on the advice, generate an image of a model wearing the suggested outfit.

Here's the clothing item to style: {{media url=itemImageUrl}}
`,
});

const provideStylingAdviceFlow = ai.defineFlow(
  {
    name: 'provideStylingAdviceFlow',
    inputSchema: ProvideStylingAdviceInputSchema,
    outputSchema: ProvideStylingAdviceOutputSchema,
  },
  async input => {
    const {output} = await stylingAdvicePrompt(input);

    // Generate outfit image based on styling advice
    const outfitImageResponse = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {text: `Generate an image of a model wearing the suggested outfit: ${output?.stylingAdvice}`},
        {media: {url: input.itemImageUrl}},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {
      stylingAdvice: output!.stylingAdvice,
      outfitImageUrl: outfitImageResponse.media!.url,
    };
  }
);

