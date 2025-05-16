
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserRecipeById } from "@/services/user-recipes";
import type { SavedRecipe } from "@/types/recipe";
import Image from "next/image";
import { ImageOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card components
import { Badge } from "@/components/ui/badge"; // For potential tags or info

export default function RecipeDetailPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !id) {
            if (!id) setLoading(false); // If no ID, nothing to load
            return;
        }

        getUserRecipeById(user.uid, id as string)
            .then(setRecipe)
            .catch((err) => {
                console.error("Error fetching recipe by ID:", err);
                setRecipe(null);
            })
            .finally(() => setLoading(false));
    }, [user, id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <div className="container mx-auto py-8 px-4 text-center text-lg">Please log in to view this recipe.</div>;
    }
    if (!recipe) {
        return <div className="container mx-auto py-8 px-4 text-center text-lg">Recipe not found or you do not have permission to view it.</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="max-w-4xl mx-auto shadow-xl overflow-hidden">
                <CardHeader className="p-0">
                    {recipe.recipeImage ? (
                        <div className="relative w-full aspect-[16/9] md:aspect-[2/1]">
                            <Image
                                src={recipe.recipeImage}
                                alt={recipe.recipeName}
                                layout="fill"
                                objectFit="cover"
                                className="bg-muted"
                                data-ai-hint="recipe cooked dish"
                            />
                        </div>
                    ) : (
                       <div className="aspect-[16/9] md:aspect-[2/1] w-full flex items-center justify-center bg-muted">
                           <ImageOff className="h-24 w-24 text-muted-foreground" />
                       </div>
                    )}
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                            {recipe.recipeName}
                        </h1>
                        {recipe.originalDishType && (
                            <p className="text-md text-muted-foreground mb-4">
                                (Inspired by: <em>{recipe.originalDishType}</em>)
                            </p>
                        )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 text-center md:text-left border-t border-b py-4">
                        {recipe.prepTime && (
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Prep Time</h3>
                                <p className="text-lg font-medium text-foreground">{recipe.prepTime}</p>
                            </div>
                        )}
                        {recipe.cookTime && (
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Cook Time</h3>
                                <p className="text-lg font-medium text-foreground">{recipe.cookTime}</p>
                            </div>
                        )}
                        {recipe.servings && (
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Servings</h3>
                                <p className="text-lg font-medium text-foreground">{recipe.servings}</p>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <h2 className="text-2xl font-semibold mb-3 text-primary">Ingredients</h2>
                        <ul className="list-disc list-inside space-y-1 text-foreground/90 bg-muted/20 p-4 rounded-md shadow-sm">
                            {recipe.ingredients.map((ingredient, idx) => <li key={idx} className="ml-4">{ingredient}</li>)}
                        </ul>
                         {recipe.originalIngredients && recipe.originalIngredients.length > 0 && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-muted-foreground">Originally identified from photo:</h4>
                                <p className="text-xs text-muted-foreground">
                                    {recipe.originalIngredients.join(', ')}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-3 text-primary">Instructions</h2>
                        <ol className="list-decimal list-inside space-y-3 text-foreground/90 bg-muted/20 p-4 rounded-md shadow-sm">
                            {recipe.instructions.map((instruction, idx) => <li key={idx} className="ml-4 leading-relaxed">{instruction}</li>)}
                        </ol>
                    </div>

                    {recipe.tips && recipe.tips.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-3 text-primary">Tips & Variations</h2>
                            <ul className="list-disc list-inside space-y-1 text-foreground/90 bg-muted/20 p-4 rounded-md shadow-sm">
                                {recipe.tips.map((tip, index) => <li key={index} className="ml-4">{tip}</li>)}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
