
"use client";

import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import type { SavedRecipe } from '@/types/recipe';
import { deleteUserRecipe, getUserRecipes } from '@/services/user-recipes';
import { Loader2, Trash2, Utensils, ImageOff, ChefHat, ShoppingBasket, Camera } from 'lucide-react';
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
import Link from 'next/link';

function MyRecipesPageContent() {
  const { user } = useAuth();
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
    return <div className="text-center p-8">Please log in to view your recipes.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-primary" /> My SnapRecipes
        </h1>
        <Button asChild>
          <Link href="/">Create New Recipe</Link>
        </Button>
      </div>

      {isLoadingRecipes ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : recipes.length === 0 ? (
        <Card className="w-full max-w-2xl mx-auto text-center shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <ChefHat className="h-7 w-7 text-primary" /> No Recipes Yet!
            </CardTitle>
            <CardDescription>You haven&apos;t saved any SnapRecipes. Let&apos;s create some!</CardDescription>
          </CardHeader>
          <CardContent>
            <Image
              src="https://placehold.co/400x250.png"
              alt="Empty recipe book"
              width={400}
              height={250}
              className="mx-auto rounded-md mb-4 bg-muted"
              data-ai-hint="cooking book"
            />
            <p className="mb-4 text-muted-foreground">
              Start by uploading a photo of your food on the homepage.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/">Create Your First Recipe</Link>
            </Button>
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
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="recipe food"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full flex items-center justify-center bg-muted rounded-t-md" data-ai-hint="recipe placeholder">
                    <ImageOff className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow space-y-4 p-4">
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                  <Utensils className="h-5 w-5" />
                  {recipe.recipeName}
                </CardTitle>
                {recipe.originalDishType && <CardDescription className="text-sm text-muted-foreground">Original dish: {recipe.originalDishType}</CardDescription>}

                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-primary flex items-center gap-1.5">
                      <ShoppingBasket className="h-4 w-4" />Ingredients:
                    </h4>
                    <ul className="list-disc list-inside text-xs text-muted-foreground max-h-20 overflow-y-auto bg-muted/30 p-2 rounded scrollbar-thin scrollbar-thumb-muted-foreground/50">
                      {recipe.ingredients.slice(0, 5).map((ing, i) => <li key={i} className="ml-2">{ing}</li>)}
                      {recipe.ingredients.length > 5 && <li className="ml-2">...and {recipe.ingredients.length - 5} more</li>}
                    </ul>
                  </div>
                )}
                {recipe.originalIngredients && recipe.originalIngredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-primary flex items-center gap-1.5">
                      <Camera className="h-4 w-4" />From Photo:
                    </h4>
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      {recipe.originalIngredients.join(', ')}
                    </p>
                  </div>
                )}
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

export default function MyRecipesPage() {
  return (
    <ProtectedRoute>
      <MyRecipesPageContent />
    </ProtectedRoute>
  );
}
