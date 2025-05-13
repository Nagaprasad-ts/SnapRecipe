
"use server"; 

import { db } from '@/lib/firebase/config';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import type { SavedRecipe } from '@/types/recipe';
import { collection, addDoc, query, getDocs, orderBy, serverTimestamp, deleteDoc, doc, Timestamp } from 'firebase/firestore';

// Firestore document limit is 1 MiB (1,048,576 bytes).
// Estimate max string length for a Base64 data URI.
// A 750KB Base64 string is roughly 560KB of binary data. This leaves ~250-300KB for other fields.
const MAX_IMAGE_DATA_URI_STRING_LENGTH = 750 * 1024; 

export async function saveUserRecipe(
  userId: string,
  recipeData: GenerateRecipeOutput,
  recipeImage?: string,
  originalIngredients?: string[],
  originalDishType?: string
): Promise<string> {
  if (!userId) {
    console.error("User ID is required to save a recipe.");
    throw new Error("User ID is required to save a recipe.");
  }

  if (recipeImage && recipeImage.length > MAX_IMAGE_DATA_URI_STRING_LENGTH) {
    const imageSizeMb = (recipeImage.length / (1024*1024)).toFixed(2); // Size of the data URI string in MB
    const estimatedBinarySizeMb = (recipeImage.length * (3/4) / (1024*1024)).toFixed(2); // Estimated binary size
    const errorMessage = `Recipe image data is too large (approx. ${estimatedBinarySizeMb}MB binary from ${imageSizeMb}MB data URI). Please use a smaller image. The total recipe, including image and text, must be under 1MB.`;
    console.error("[saveUserRecipe] " + errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const recipesCollectionRef = collection(db, 'users', userId, 'recipes');
    const docData = {
      ...recipeData,
      userId,
      createdAt: serverTimestamp(),
      recipeImage: recipeImage || null,
      originalIngredients: originalIngredients || [],
      originalDishType: originalDishType || '',
    };
    
    console.log("[saveUserRecipe] Attempting to add document to Firestore with image URI length:", recipeImage?.length);
    const docRef = await addDoc(recipesCollectionRef, docData);
    console.log("[saveUserRecipe] Document added successfully with ID:", docRef.id);
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
    const recipesCollectionRef = collection(db, 'users', userId, 'recipes');
    const q = query(recipesCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      // Ensure createdAt is a number (milliseconds)
      let createdAtNumeric: number;
      if (data.createdAt instanceof Timestamp) {
        createdAtNumeric = data.createdAt.toMillis();
      } else if (typeof data.createdAt === 'number') {
        createdAtNumeric = data.createdAt; // Should ideally not happen if serverTimestamp is used
      } else if (data.createdAt && typeof data.createdAt.seconds === 'number' && typeof data.createdAt.nanoseconds === 'number') {
        // Handle plain object representation of Timestamp if it occurs
        createdAtNumeric = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toMillis();
      }
      else {
        createdAtNumeric = Date.now(); // Fallback, though ideally should always be a Timestamp
      }
      
      return {
        id: docSnap.id,
        recipeName: data.recipeName || 'Unnamed Recipe',
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        userId: data.userId || '',
        createdAt: createdAtNumeric,
        recipeImage: data.recipeImage || undefined,
        originalIngredients: data.originalIngredients || [],
        originalDishType: data.originalDishType || '',
      } as SavedRecipe;
    });
  } catch (error) {
    console.error("[getUserRecipes] Error fetching user recipes from Firestore:", error);
    return []; 
  }
}

export async function deleteUserRecipe(userId: string, recipeId: string): Promise<boolean> {
  if (!userId || !recipeId) {
    console.error("[deleteUserRecipe] User ID and Recipe ID are required to delete a recipe.");
    return false; 
  }
  try {
    const recipeDocRef = doc(db, 'users', userId, 'recipes', recipeId);
    await deleteDoc(recipeDocRef);
    console.log(`[deleteUserRecipe] Recipe ${recipeId} deleted successfully for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`[deleteUserRecipe] Error deleting recipe ${recipeId} for user ${userId}:`, error);
    return false; 
  }
}
