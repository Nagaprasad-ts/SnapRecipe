
"use server";

import { db } from "@/lib/firebase/config";
import type { UserPreferences } from "@/types/user";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Retrieves user preferences from Firestore.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the user's preferences or null if not found/error.
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (!userId) {
    console.error("User ID is required to get preferences.");
    return null;
  }
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Return preferences if they exist, otherwise a default structure
      return (data.preferences as UserPreferences) || { dietaryRestrictions: [], preferredCuisines: [] };
    } else {
      // User document might not exist if preferences haven't been set, or no other profile info saved
      // console.log("No user document found for preferences, returning default.");
      return { dietaryRestrictions: [], preferredCuisines: [] };
    }
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null; // Or throw error, depending on desired error handling
  }
}

/**
 * Saves or updates user preferences in Firestore.
 * It creates the user document if it doesn't exist, or updates the preferences field.
 * @param userId The ID of the user.
 * @param preferences The preferences object to save.
 * @returns A promise that resolves when the preferences are saved.
 */
export async function saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  if (!userId) {
    console.error("User ID is required to save preferences.");
    throw new Error("User ID is required.");
  }
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      // User document exists, update it
      await updateDoc(userDocRef, {
        preferences: preferences,
        preferencesLastUpdatedAt: serverTimestamp(),
      });
    } else {
      // User document doesn't exist, create it with preferences
      // This is useful if user profile is minimal and preferences are the first thing being set
      // Or if user documents are not pre-created upon registration
      await setDoc(userDocRef, {
        // Include any other default user fields if necessary upon creation
        // email: userEmail, // Potentially pass user email if creating the doc
        // displayName: userName, // Potentially pass user display name
        preferences: preferences,
        createdAt: serverTimestamp(), // Assuming this is the first time user doc is created
        preferencesLastUpdatedAt: serverTimestamp(),
      });
    }
    console.log("User preferences saved successfully for user:", userId);
  } catch (error) {
    console.error("Error saving user preferences:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to save preferences: ${error.message}`);
    }
    throw new Error("An unknown error occurred while saving preferences.");
  }
}
