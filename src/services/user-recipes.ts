
"use server"; 

// Note: "use server" is for Next.js Server Actions. 
// These functions will be called from Server Components or Server Actions.
// If called from client components, they'd be wrapped in server actions or API routes.
// For simplicity and direct use with client-side initiated saves, we'll allow client-side calling
// but acknowledge that in a strict RSC model, these would be server actions.
// However, Firebase SDK is client-side friendly.

import { db } from '@/lib/firebase/config';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import type { SavedRecipe } from '@/types/recipe';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, deleteDoc, doc, Timestamp } from 'firebase/firestore';

export async function saveUserRecipe(
  userId: string,
  recipeData: GenerateRecipeOutput,
  recipeImage?: string,
  originalIngredients?: string[],
  originalDishType?: string
): Promise<string | null> {
  if (!userId) {
    console.error("User ID is required to save a recipe.");
    return null;
  }

  try {
    const recipesCollectionRef = collection(db, 'users', userId, 'recipes');
    const docRef = await addDoc(recipesCollectionRef, {
      ...recipeData,
      userId,
      createdAt: serverTimestamp(), // Use serverTimestamp for consistent timing
      recipeImage: recipeImage || null,
      originalIngredients: originalIngredients || [],
      originalDishType: originalDishType || '',
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving recipe to Firestore:", error);
    return null;
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
      // Convert Firestore Timestamp to number if it exists
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now();
      return {
        id: docSnap.id,
        ...data,
        createdAt,
      } as SavedRecipe;
    });
  } catch (error) {
    console.error("Error fetching user recipes from Firestore:", error);
    return [];
  }
}

export async function deleteUserRecipe(userId: string, recipeId: string): Promise<boolean> {
  if (!userId || !recipeId) {
    console.error("User ID and Recipe ID are required to delete a recipe.");
    return false;
  }
  try {
    const recipeDocRef = doc(db, 'users', userId, 'recipes', recipeId);
    await deleteDoc(recipeDocRef);
    return true;
  } catch (error) {
    console.error("Error deleting recipe from Firestore:", error);
    return false;
  }
}
