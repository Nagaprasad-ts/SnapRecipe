
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
    .describe('A list of ingredients identified in the photo. Example: ["Chicken breast, diced", "Broccoli florets", "Brown rice, cooked"]'),
  dishType: z.string().describe('The type of dish identified in the photo. Example: "Chicken and broccoli stir-fry with brown rice" or "Vegetable soup"'),
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
  prompt: `You are an expert culinary analyst and chef. Your task is to meticulously examine the provided photo of a food item or dish.
From this photo, you must:
1.  Identify all visible primary ingredients. Be as specific as possible (e.g., "roma tomatoes, diced" instead of just "tomatoes"; "chicken breast, grilled" instead of "chicken").
2.  If discernible, suggest common preparations (e.g., "fresh basil leaves, chiffonade"). Do not guess quantities unless very obvious.
3.  Determine the most likely type of dish. Be descriptive (e.g., "Hearty beef and vegetable stew", "Light summer salad with vinaigrette dressing", "Spicy Thai green curry with chicken").
4.  Optionally, if the dish is very common, you can list 1-2 typical accompanying ingredients or garnishes that might not be clearly visible but are standard for such a dish (e.g., for a burger, you might suggest "pickles, onions" if appropriate).

Analyze the following photo:
Photo: {{media url=photoDataUri}}

Structure your response strictly according to the output schema:
- \`ingredients\`: An array of strings, where each string is an identified ingredient (e.g., "Red bell pepper, sliced", "Cooked quinoa", "Feta cheese, crumbled").
- \`dishType\`: A string describing the type of dish (e.g., "Mediterranean quinoa salad").
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

