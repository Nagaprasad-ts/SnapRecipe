
"use client";

import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import type { SavedRecipe } from '@/types/recipe';
import { deleteUserRecipe, getUserRecipes } from '@/services/user-recipes';
import { Loader2, Trash2, Utensils, ImageOff, ChefHat } from 'lucide-react';
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

function ProfilePageContent() {
  const { user, signOutUser } = useAuth();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
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
    }
  }, [user, toast]);

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
  
  if (!user) {
    // This case should ideally be handled by ProtectedRoute, but as a fallback:
    return <div className="text-center p-8">Please log in to view your profile.</div>;
  }

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : <ChefHat size={20} />;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl mb-8">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{user.displayName || 'User Profile'}</CardTitle>
            <CardDescription className="text-lg">{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={signOutUser}>
            Log Out
          </Button>
        </CardFooter>
      </Card>

      <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">My Saved Recipes</h2>
      {isLoadingRecipes ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : recipes.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">You haven&apos;t saved any recipes yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="flex flex-col">
              <CardHeader>
                {recipe.recipeImage ? (
                  <div className="aspect-video w-full relative rounded-t-md overflow-hidden bg-muted">
                    <Image
                      src={recipe.recipeImage}
                      alt={recipe.recipeName || "Recipe image"}
                      layout="fill"
                      objectFit="cover"
                       data-ai-hint="recipe food"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full flex items-center justify-center bg-muted rounded-t-md">
                    <ImageOff className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                 <CardTitle className="mt-4 text-xl flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    {recipe.recipeName}
                </CardTitle>
                {recipe.originalDishType && <CardDescription>Original dish type: {recipe.originalDishType}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Ingredients:</h4>
                  <ul className="list-disc list-inside text-xs text-muted-foreground max-h-24 overflow-y-auto bg-background p-2 rounded">
                    {recipe.ingredients.slice(0, 5).map((ing, i) => <li key={i}>{ing}</li>)}
                    {recipe.ingredients.length > 5 && <li>...and more</li>}
                  </ul>
                </div>
                 {recipe.originalIngredients && recipe.originalIngredients.length > 0 && (
                   <div>
                     <h4 className="font-semibold text-sm mb-1">Identified in Photo:</h4>
                     <p className="text-xs text-muted-foreground bg-background p-2 rounded">
                       {recipe.originalIngredients.join(', ')}
                     </p>
                   </div>
                 )}
              </CardContent>
              <CardFooter>
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
                      <AlertDialogAction onClick={() => handleDeleteRecipe(recipe.id)}>
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
