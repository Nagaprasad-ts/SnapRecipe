
"use client";

import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import type { SavedRecipe } from '@/types/recipe';
import { deleteUserRecipe, getUserRecipes } from '@/services/user-recipes';
import { getUserPreferences, saveUserPreferences } from '@/services/user-profile'; // Added
import type { UserPreferences, DietaryRestrictionId } from '@/types/user'; // Added
import { AVAILABLE_DIETARY_RESTRICTIONS } from '@/types/user'; // Added
import { Loader2, Trash2, Utensils, ImageOff, ChefHat, Settings, Save } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { Label } from '@/components/ui/label'; // Added
import { Checkbox } from '@/components/ui/checkbox'; // Added
import { Textarea } from '@/components/ui/textarea'; // Added
import { AccentButton } from '@/components/ui/accent-button';

function ProfilePageContent() {
  const { user, signOutUser } = useAuth();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({ dietaryRestrictions: [], preferredCuisines: [] });
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const [preferredCuisinesInput, setPreferredCuisinesInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setIsLoadingRecipes(true);
      getUserRecipes(user.uid)
        .then(setRecipes)
        .catch(err => {
          console.error("Failed to load recipes:", err);
          toast({ variant: "destructive", title: "Error", description: "Could not load your recipes." });
        })
        .finally(() => setIsLoadingRecipes(false));

      setIsLoadingPreferences(true);
      getUserPreferences(user.uid)
        .then(prefs => {
          if (prefs) {
            setPreferences(prefs);
          }
        })
        .catch(err => {
          console.error("Failed to load preferences:", err);
          toast({ variant: "destructive", title: "Error", description: "Could not load your preferences." });
        })
        .finally(() => setIsLoadingPreferences(false));
    }
  }, [user, toast]);

  // Sync local input string when preferences change (e.g., on mount or external update)
  useEffect(() => {
    setPreferredCuisinesInput((preferences.preferredCuisines || []).join(', '));
  }, [preferences.preferredCuisines]);

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!user) return;
    try {
      const success = await deleteUserRecipe(user.uid, recipeId);
      if (success) {
        setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
        toast({ title: "Recipe Deleted", description: "The recipe has been removed from your collection." });
      } else {
        throw new Error("Deletion failed");
      }
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete the recipe. Please try again." });
    }
  };

  const handleDietaryRestrictionChange = (restrictionId: DietaryRestrictionId, checked: boolean) => {
    setPreferences(prev => {
      const currentRestrictions = prev.dietaryRestrictions || [];
      if (checked) {
        return { ...prev, dietaryRestrictions: [...currentRestrictions, restrictionId] };
      } else {
        return { ...prev, dietaryRestrictions: currentRestrictions.filter(id => id !== restrictionId) };
      }
    });
  };

  const handlePreferredCuisinesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPreferredCuisinesInput(event.target.value);
  };

  const handlePreferredCuisinesBlur = () => {
    const cuisinesArray = preferredCuisinesInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    setPreferences(prev => ({
      ...prev,
      preferredCuisines: cuisinesArray,
    }));
  };

  const handleSavePreferences = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save preferences." });
      return;
    }
    setIsSavingPreferences(true);
    try {
      await saveUserPreferences(user.uid, preferences);
      toast({ title: "Preferences Saved", description: "Your recipe preferences have been updated." });
    } catch (error) {
      console.error("Failed to save preferences:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not save preferences.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  if (!user) {
    return <div className="text-center">Please log in to view your profile.</div>;
  }

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : <ChefHat size={20} />;

  return (
    <div className="w-full space-y-8">
      <Card className="w-full shadow-xl">
        <CardHeader className="flex flex-col items-center gap-4 sm:flex-row sm:items-start text-center sm:text-left">
          <Avatar className="h-24 w-24 text-4xl">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="user profile" />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl">{user.displayName || 'User Profile'}</CardTitle>
            <CardDescription className="text-lg">{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="justify-center sm:justify-end">
          <Button variant="destructive" onClick={signOutUser}>
            <Trash2 />Log Out
          </Button>
        </CardFooter>
      </Card>

      {/* Preferences Section */}
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <Settings className="h-7 w-7" /> Recipe Preferences
          </CardTitle>
          <CardDescription>Help us tailor recipe suggestions to your taste and needs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingPreferences ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div>
                <Label className="text-lg font-semibold text-secondary mb-2 block">Dietary Restrictions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {AVAILABLE_DIETARY_RESTRICTIONS.map(restriction => (
                    <div key={restriction.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`restriction-${restriction.id}`}
                        checked={(preferences.dietaryRestrictions || []).includes(restriction.id)}
                        onCheckedChange={(checked) => handleDietaryRestrictionChange(restriction.id, !!checked)}
                      />
                      <Label htmlFor={`restriction-${restriction.id}`} className="font-normal text-base">
                        {restriction.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="preferredCuisines" className="text-lg font-semibold text-secondary mb-2 block">
                  Preferred Cuisines
                </Label>
                <Textarea
                  id="preferredCuisines"
                  placeholder="e.g., Italian, Mexican, Thai, Indian (comma-separated)"
                  value={preferredCuisinesInput}
                  onChange={handlePreferredCuisinesChange}
                  onBlur={handlePreferredCuisinesBlur}
                  rows={3}
                  className="text-base"
                />
                <p className="text-sm text-muted-foreground mt-1">Enter cuisines you enjoy, separated by commas.</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <AccentButton onClick={handleSavePreferences} disabled={isLoadingPreferences || isSavingPreferences} className="ml-auto">
            {isSavingPreferences ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Preferences
          </AccentButton>
        </CardFooter>
      </Card>


      <h2 className="text-2xl font-semibold text-center md:text-left text-primary flex items-center gap-2">
        <ChefHat className="h-7 w-7" /> My Saved Recipes
      </h2>
      {isLoadingRecipes ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : recipes.length === 0 ? (
        <Card className="w-full text-center shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
              <ChefHat className="h-7 w-7" /> No Recipes Yet!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Image
              src="https://placehold.co/400x250.png"
              alt="Empty recipe book"
              width={400}
              height={250}
              className="mx-auto rounded-md mb-4 bg-muted shadow"
              data-ai-hint="cooking book"
            />
            <p className="mb-4 text-muted-foreground">
              It looks like you haven't saved any SnapRecipes yet.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <AccentButton asChild size="lg">
              <Link href="/">Create Your First Recipe</Link>
            </AccentButton>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
              <CardHeader className="p-0">
                {recipe.recipeImage ? (
                  <div className="aspect-video w-full relative rounded-t-md overflow-hidden bg-muted">
                    <Image
                      src={recipe.recipeImage}
                      alt={recipe.recipeName || "Recipe image"}
                      fill
                      style={{ objectFit: "cover" }}
                      data-ai-hint="recipe food"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full flex items-center justify-center bg-muted rounded-t-md" data-ai-hint="recipe placeholder">
                    <ImageOff className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow space-y-3 p-4">
                <CardTitle className="mt-2 text-xl flex items-center gap-2 text-primary">
                  <Utensils className="h-5 w-5" />
                  {recipe.recipeName}
                </CardTitle>
                {recipe.originalDishType && <CardDescription className="text-sm text-muted-foreground">Original dish type: {recipe.originalDishType}</CardDescription>}

                {/* Minimal ingredients display - details on recipe page */}
              </CardContent>
              <CardFooter className="p-4 border-t flex flex-col sm:flex-row gap-2">
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href={`/my-recipes/${recipe.id}`}>View Recipe</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the recipe &quot;{recipe.recipeName}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteRecipe(recipe.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
