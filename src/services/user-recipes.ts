
"use server";

import { db } from "@/lib/firebase/config";
import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import type { IdentifyIngredientsOutput } from "@/ai/flows/identify-ingredients"; // Added
import type { SavedRecipe, NutritionalInfo } from "@/types/recipe";
import {
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
} from "firebase/firestore";

// Firestore document limit is 1 MiB (1,048,576 bytes).
const MAX_IMAGE_DATA_URI_STRING_LENGTH = 750 * 1024;

const defaultNutritionalInfo: NutritionalInfo = {
  calories: "N/A",
  protein: "N/A",
  carbohydrates: "N/A",
  fat: "N/A",
};

export async function saveUserRecipe(
  userId: string,
  recipeData: GenerateRecipeOutput, // This now includes recipe's nutritionalInfo
  uploadedImageDataUri?: string,
  identifiedIngredientsData?: IdentifyIngredientsOutput // Pass the whole object
): Promise<string> {
  if (!userId) {
    console.error("User ID is required to save a recipe.");
    throw new Error("User ID is required to save a recipe.");
  }

  if (uploadedImageDataUri && uploadedImageDataUri.length > MAX_IMAGE_DATA_URI_STRING_LENGTH) {
    const imageSizeMb = (uploadedImageDataUri.length / (1024 * 1024)).toFixed(2);
    const estimatedBinarySizeMb = (
      (uploadedImageDataUri.length * (3 / 4)) /
      (1024 * 1024)
    ).toFixed(2);
    const errorMessage = `Recipe image data is too large (approx. ${estimatedBinarySizeMb}MB binary from ${imageSizeMb}MB data URI). Please use a smaller image.`;
    console.error("[saveUserRecipe] " + errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const recipesCollectionRef = collection(db, "users", userId, "recipes");
    const docData = {
      // from recipeData (GenerateRecipeOutput)
      recipeName: recipeData.recipeName,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      prepTime: recipeData.prepTime || null,
      cookTime: recipeData.cookTime || null,
      servings: recipeData.servings || null,
      tips: recipeData.tips || [],
      nutritionalInfo: recipeData.nutritionalInfo || defaultNutritionalInfo, // Nutritional info for the recipe

      // from other params
      userId,
      createdAt: serverTimestamp(),
      recipeImage: uploadedImageDataUri || null,
      
      // from identifiedIngredientsData (IdentifyIngredientsOutput)
      originalIngredients: identifiedIngredientsData?.ingredients || [],
      originalDishType: identifiedIngredientsData?.dishType || "",
      originalNutritionalInfo: identifiedIngredientsData?.nutritionalInfo || defaultNutritionalInfo, // Nutritional info from photo
    };

    console.log(
      "[saveUserRecipe] Attempting to add document to Firestore with image URI length:",
      uploadedImageDataUri?.length
    );
    const docRef = await addDoc(recipesCollectionRef, docData);
    console.log(
      "[saveUserRecipe] Document added successfully with ID:",
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    console.error("[saveUserRecipe] Error saving recipe to Firestore:", error);
    if (error instanceof Error) {
      throw new Error(`Firestore save failed: ${error.message}`);
    }
    throw new Error("Firestore save failed with an unknown error.");
  }
}

export async function getUserRecipes(userId: string): Promise<SavedRecipe[]> {
  if (!userId) {
    return [];
  }
  try {
    const recipesCollectionRef = collection(db, "users", userId, "recipes");
    const q = query(recipesCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      let createdAtNumeric: number;
      if (data.createdAt instanceof Timestamp) {
        createdAtNumeric = data.createdAt.toMillis();
      } else if (typeof data.createdAt === "number") {
        createdAtNumeric = data.createdAt;
      } else if (
        data.createdAt &&
        typeof data.createdAt.seconds === "number" &&
        typeof data.createdAt.nanoseconds === "number"
      ) {
        createdAtNumeric = new Timestamp(
          data.createdAt.seconds,
          data.createdAt.nanoseconds
        ).toMillis();
      } else {
        createdAtNumeric = Date.now();
      }

      return {
        id: docSnap.id,
        recipeName: data.recipeName || "Unnamed Recipe",
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        userId: data.userId || "",
        createdAt: createdAtNumeric,
        recipeImage: data.recipeImage || undefined,
        originalIngredients: data.originalIngredients || [],
        originalDishType: data.originalDishType || "",
        prepTime: data.prepTime || undefined,
        cookTime: data.cookTime || undefined,
        servings: data.servings || undefined,
        tips: data.tips || [],
        nutritionalInfo: data.nutritionalInfo || defaultNutritionalInfo,
        originalNutritionalInfo: data.originalNutritionalInfo || defaultNutritionalInfo,
      } as SavedRecipe;
    });
  } catch (error) {
    console.error(
      "[getUserRecipes] Error fetching user recipes from Firestore:",
      error
    );
    return [];
  }
}

export async function deleteUserRecipe(
  userId: string,
  recipeId: string
): Promise<boolean> {
  if (!userId || !recipeId) {
    console.error(
      "[deleteUserRecipe] User ID and Recipe ID are required to delete a recipe."
    );
    return false;
  }
  try {
    const recipeDocRef = doc(db, "users", userId, "recipes", recipeId);
    await deleteDoc(recipeDocRef);
    console.log(
      `[deleteUserRecipe] Recipe ${recipeId} deleted successfully for user ${userId}`
    );
    return true;
  } catch (error) {
    console.error(
      `[deleteUserRecipe] Error deleting recipe ${recipeId} for user ${userId}:`,
      error
    );
    return false;
  }
}

export async function getUserRecipeById(
  userId: string,
  recipeId: string
): Promise<SavedRecipe | null> {
  if (!userId || !recipeId) {
    console.error("[getUserRecipeById] User ID and Recipe ID are required.");
    return null;
  }

  try {
    const recipeDocRef = doc(db, "users", userId, "recipes", recipeId);
    const docSnap = await getDoc(recipeDocRef);

    if (!docSnap.exists()) {
      console.warn(`[getUserRecipeById] Recipe not found: ${recipeId}`);
      return null;
    }

    const data = docSnap.data();

    let createdAtNumeric: number;
    if (data.createdAt instanceof Timestamp) {
      createdAtNumeric = data.createdAt.toMillis();
    } else {
      createdAtNumeric = Date.now(); // Fallback, should ideally not happen for new data
    }

    return {
      id: docSnap.id,
      recipeName: data.recipeName || "Unnamed Recipe",
      ingredients: data.ingredients || [],
      instructions: data.instructions || [],
      userId: data.userId || "",
      createdAt: createdAtNumeric,
      recipeImage: data.recipeImage || undefined,
      originalIngredients: data.originalIngredients || [],
      originalDishType: data.originalDishType || "",
      prepTime: data.prepTime || undefined,
      cookTime: data.cookTime || undefined,
      servings: data.servings || undefined,
      tips: data.tips || [],
      nutritionalInfo: data.nutritionalInfo || defaultNutritionalInfo,
      originalNutritionalInfo: data.originalNutritionalInfo || defaultNutritionalInfo,
    } as SavedRecipe;
  } catch (error) {
    console.error(
      `[getUserRecipeById] Failed to fetch recipe ${recipeId}:`,
      error
    );
    return null;
  }
}
