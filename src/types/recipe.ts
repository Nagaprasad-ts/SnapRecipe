
import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe";

export interface SavedRecipe extends GenerateRecipeOutput {
  id: string; // Firestore document ID
  userId: string;
  createdAt: number; // Timestamp
  recipeImage?: string; // Data URI of the original uploaded image
  originalIngredients?: string[];
  originalDishType?: string;
}
