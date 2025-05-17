
export interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  // Future: dislikedIngredients?: string[];
}

export const AVAILABLE_DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian (No meat or fish)' },
  { id: 'vegan', label: 'Vegan (No animal products)' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'nut-free', label: 'Nut-Free' },
  // Add more common restrictions as needed
] as const;

export type DietaryRestrictionId = typeof AVAILABLE_DIETARY_RESTRICTIONS[number]['id'];
