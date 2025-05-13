'use server';
/**
 * @fileOverview An AI agent to identify ingredients from a photo of food.
 *
 * - identifyIngredients - A function that handles the ingredient identification process.
 * - IdentifyIngredientsInput - The input type for the identifyIngredients function.
 * - IdentifyIngredientsOutput - The return type for the identifyIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyIngredientsInput = z.infer<typeof IdentifyIngredientsInputSchema>;

const IdentifyIngredientsOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients identified in the photo.'),
  dishType: z.string().describe('The type of dish identified in the photo.'),
});
export type IdentifyIngredientsOutput = z.infer<typeof IdentifyIngredientsOutputSchema>;

export async function identifyIngredients(
  input: IdentifyIngredientsInput
): Promise<IdentifyIngredientsOutput> {
  return identifyIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyIngredientsPrompt',
  input: {schema: IdentifyIngredientsInputSchema},
  output: {schema: IdentifyIngredientsOutputSchema},
  prompt: `You are an expert chef. You will analyze the photo of food and identify the ingredients present in the photo and the type of dish.

  Analyze the following photo and identify ingredients and dish type.

  Photo: {{media url=photoDataUri}}

  Respond with a list of ingredients and the dish type.
  `,
});

const identifyIngredientsFlow = ai.defineFlow(
  {
    name: 'identifyIngredientsFlow',
    inputSchema: IdentifyIngredientsInputSchema,
    outputSchema: IdentifyIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
