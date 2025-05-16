
import type { GenerateRecipeOutput, NutritionalInfo as GenRecipeNutritionalInfo } from "@/ai/flows/generate-recipe";
import type { NutritionalInfo as IdentifyIngredientsNutritionalInfo } from "@/ai/flows/identify-ingredients";

// Consolidate NutritionalInfo type, assuming they will be the same structure.
// If they can diverge, they should remain separate or have a shared base.
export type NutritionalInfo = GenRecipeNutritionalInfo; // Or IdentifyIngredientsNutritionalInfo

export interface SavedRecipe extends Omit<GenerateRecipeOutput, 'nutritionalInfo'> {
  id: string; // Firestore document ID
  userId: string;
  createdAt: number; // Timestamp
  recipeImage?: string; // Data URI of the original uploaded image
  originalIngredients?: string[];
  originalDishType?: string;
  originalNutritionalInfo?: IdentifyIngredientsNutritionalInfo; // Nutritional info from the initial photo identification
  nutritionalInfo: NutritionalInfo; // Nutritional info for the generated recipe
}
