"use server"; 

import { db } from '@/lib/firebase/config';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import type { SavedRecipe } from '@/types/recipe';
import { collection, addDoc, query, getDocs, orderBy, serverTimestamp, deleteDoc, doc, Timestamp } from 'firebase/firestore';

export async function saveUserRecipe(
  userId: string,
  recipeData: GenerateRecipeOutput,
  recipeImage?: string,
  originalIngredients?: string[],
  originalDishType?: string
): Promise<string> { // Changed return type from Promise<string | null>
  if (!userId) {
    console.error("User ID is required to save a recipe.");
    throw new Error("User ID is required to save a recipe.");
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
    
    // Basic check for very large image data URI, though Firestore has its own limits.
    if (recipeImage && recipeImage.length > 1.5 * 1024 * 1024) { // Approx 1.5MB, Firestore limit is 1MiB for document.
        console.warn("Recipe image might be too large, potentially causing save issues.");
        // Potentially strip image or throw specific error if image is critical part of failure.
        // For now, let Firestore handle the detailed error.
    }

    const docRef = await addDoc(recipesCollectionRef, docData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving recipe to Firestore:", error); // This logs to the server console
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
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now();
      return {
        id: docSnap.id,
        ...data,
        createdAt,
      } as SavedRecipe;
    });
  } catch (error) {
    console.error("Error fetching user recipes from Firestore:", error);
    return []; // Optionally, rethrow or handle more explicitly
  }
}

export async function deleteUserRecipe(userId: string, recipeId: string): Promise<boolean> {
  if (!userId || !recipeId) {
    console.error("User ID and Recipe ID are required to delete a recipe.");
    return false; // Or throw
  }
  try {
    const recipeDocRef = doc(db, 'users', userId, 'recipes', recipeId);
    await deleteDoc(recipeDocRef);
    return true;
  } catch (error) {
    console.error("Error deleting recipe from Firestore:", error);
    return false; // Or throw
  }
}
