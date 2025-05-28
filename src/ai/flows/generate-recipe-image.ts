
'use server';
/**
 * @fileOverview Generates an image for a recipe.
 *
 * - generateRecipeImage - A function that generates an image for a recipe.
 * - GenerateRecipeImageInput - The input type for the generateRecipeImage function.
 * - GenerateRecipeImageOutput - The return type for the generateRecipeImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Internal schema definition, not exported
const GenerateRecipeImageInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe. Example: "Spicy Chicken Stir-fry"'),
});
export type GenerateRecipeImageInput = z.infer<typeof GenerateRecipeImageInputSchema>;

// Internal schema definition, not exported
const GenerateRecipeImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateRecipeImageOutput = z.infer<typeof GenerateRecipeImageOutputSchema>;

export async function generateRecipeImage(input: GenerateRecipeImageInput): Promise<GenerateRecipeImageOutput> {
  return generateRecipeImageFlow(input);
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async (input) => {
    // Construct a more descriptive prompt for better image results
    const prompt = `Generate a vibrant, appetizing, and photo-realistic image of a dish titled "${input.recipeName}". 
    Focus on a clear view of the food itself, making it look delicious and well-plated. 
    IMPORTANT: The image MUST be optimized for web use with a significantly reduced file size, ideally under 500KB, and preferably closer to 200-300KB if possible, without sacrificing too much visual quality for a typical recipe website display.
    Prioritize efficient compression.
    Avoid text overlays, people, or hands in the image. 
    Emphasize the colors and textures of the ingredients.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
      },
    });

    if (!media?.url) {
      console.error('AI failed to generate an image or provide a valid URL. Media object:', media);
      throw new Error('AI failed to generate an image or provide a valid image URL.');
    }
    
    if (!media.url.startsWith('data:image')) {
        console.error('Generated media URL is not a data URI:', media.url);
        throw new Error('Generated image was not in the expected data URI format.');
    }

    return { imageDataUri: media.url };
  }
);
