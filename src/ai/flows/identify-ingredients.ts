
'use server';
/**
 * @fileOverview An AI agent to identify ingredients and nutritional information from a photo of food.
 *
 * - identifyIngredients - A function that handles the ingredient identification process.
 * - IdentifyIngredientsInput - The input type for the identifyIngredients function.
 * - IdentifyIngredientsOutput - The return type for the identifyIngredients function.
 * - NutritionalInfo - The type for nutritional information.
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

const NutritionalInfoSchema = z.object({
  calories: z.string().describe('Estimated calories per serving or for the dish. Example: "350 kcal"'),
  protein: z.string().describe('Estimated protein per serving or for the dish. Example: "30g"'),
  carbohydrates: z.string().describe('Estimated carbohydrates per serving or for the dish. Example: "25g"'),
  fat: z.string().describe('Estimated fat per serving or for the dish. Example: "15g"'),
  // Consider adding servingSize: z.string().optional().describe('Estimated serving size for the nutritional info. Example: "1 serving (approx. 250g)"')
});
export type NutritionalInfo = z.infer<typeof NutritionalInfoSchema>;

const IdentifyIngredientsOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients identified in the photo. Example: ["Chicken breast, diced", "Broccoli florets", "Brown rice, cooked"]'),
  dishType: z.string().describe('The type of dish identified in the photo. Example: "Chicken and broccoli stir-fry with brown rice" or "Vegetable soup"'),
  nutritionalInfo: NutritionalInfoSchema.describe('Estimated nutritional information for the identified dish.'),
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
  prompt: `You are an expert culinary analyst and nutritionist. Your task is to meticulously examine the provided photo of a food item or dish.
From this photo, you must:
1.  Identify all visible primary ingredients. Be as specific as possible (e.g., "roma tomatoes, diced" instead of just "tomatoes"; "chicken breast, grilled" instead of "chicken").
2.  If discernible, suggest common preparations (e.g., "fresh basil leaves, chiffonade"). Do not guess quantities unless very obvious.
3.  Determine the most likely type of dish. Be descriptive (e.g., "Hearty beef and vegetable stew", "Light summer salad with vinaigrette dressing", "Spicy Thai green curry with chicken").
4.  Provide an estimated nutritional analysis for what appears to be a single serving of the dish in the photo. This includes calories, protein, carbohydrates, and fat. This is a mandatory field.
5.  Optionally, if the dish is very common, you can list 1-2 typical accompanying ingredients or garnishes that might not be clearly visible but are standard for such a dish (e.g., for a burger, you might suggest "pickles, onions" if appropriate).

Analyze the following photo:
Photo: {{media url=photoDataUri}}

Structure your response strictly according to the output schema:
- \`ingredients\`: An array of strings, where each string is an identified ingredient (e.g., "Red bell pepper, sliced", "Cooked quinoa", "Feta cheese, crumbled").
- \`dishType\`: A string describing the type of dish (e.g., "Mediterranean quinoa salad").
- \`nutritionalInfo\`: An object with the following MANDATORY fields:
    - \`calories\`: Estimated calories (e.g., "350 kcal").
    - \`protein\`: Estimated protein (e.g., "30g").
    - \`carbohydrates\`: Estimated carbohydrates (e.g., "25g").
    - \`fat\`: Estimated fat (e.g., "15g").
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  }
});

const identifyIngredientsFlow = ai.defineFlow(
  {
    name: 'identifyIngredientsFlow',
    inputSchema: IdentifyIngredientsInputSchema,
    outputSchema: IdentifyIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to provide an output for ingredient identification.");
    }
    // Ensure nutritionalInfo is present, even if the model somehow misses it despite the prompt.
    // This is more of a fallback, as Zod parsing should catch this based on the schema.
    if (!output.nutritionalInfo) {
        console.warn("AI output missing nutritionalInfo, attempting to add default. This indicates a prompt issue.");
        output.nutritionalInfo = { calories: "N/A", protein: "N/A", carbohydrates: "N/A", fat: "N/A" };
    }
    return output;
  }
);
