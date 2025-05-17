
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
  // Consider adding dishType: z.string().optional().describe('The type of dish to help guide image generation. Example: "Stir-fry"')
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
    inputSchema: GenerateRecipeImageInputSchema, // Use internal schema
    outputSchema: GenerateRecipeImageOutputSchema, // Use internal schema
  },
  async (input) => {
    // Construct a more descriptive prompt for better image results
    const prompt = `Generate a vibrant, appetizing, and photo-realistic image of a dish titled "${input.recipeName}". 
    Focus on a clear view of the food itself, making it look delicious and well-plated. 
    The image should be high quality, suitable for a recipe website, and optimized for web use with a smaller file size, ideally under 500KB if possible. 
    Avoid text overlays, people, or hands in the image. 
    Emphasize the colors and textures of the ingredients.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
        // Optional: Add safety settings if experiencing issues with content generation
        // safetySettings: [
        //   { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        //   { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        //   { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        //   { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        // ],
      },
    });

    if (!media?.url) {
      console.error('AI failed to generate an image or provide a valid URL. Media object:', media);
      throw new Error('AI failed to generate an image or provide a valid image URL.');
    }
    
    // Ensure the URL is a data URI
    if (!media.url.startsWith('data:image')) {
        console.error('Generated media URL is not a data URI:', media.url);
        throw new Error('Generated image was not in the expected data URI format.');
    }

    return { imageDataUri: media.url };
  }
);

