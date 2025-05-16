
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserRecipeById } from "@/services/user-recipes";
import type { SavedRecipe, NutritionalInfo } from "@/types/recipe"; // Import NutritionalInfo
import Image from "next/image";
import { ImageOff, Loader2, Utensils, Activity, Info } from "lucide-react"; // Added Activity, Info icons
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecipeDetailPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !id) {
            if (!id) setLoading(false);
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

    const renderNutritionalInfo = (ni: NutritionalInfo, title: string) => (
        <div>
            <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center gap-2">
                <Activity className="h-6 w-6" /> {title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 bg-muted/20 p-4 rounded-md shadow-sm text-sm">
                <div><strong className="block text-muted-foreground">Calories:</strong> {ni.calories}</div>
                <div><strong className="block text-muted-foreground">Protein:</strong> {ni.protein}</div>
                <div><strong className="block text-muted-foreground">Carbs:</strong> {ni.carbohydrates}</div>
                <div><strong className="block text-muted-foreground">Fat:</strong> {ni.fat}</div>
            </div>
        </div>
    );

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
                <CardContent className="p-6 md:p-8 space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center gap-3">
                           <Utensils className="h-8 w-8 md:h-9 md:w-9"/> {recipe.recipeName}
                        </h1>
                        {recipe.originalDishType && (
                             <Badge variant="secondary" className="text-sm">Inspired by: {recipe.originalDishType}</Badge>
                        )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 text-center md:text-left border-t border-b py-6">
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
                    
                    {/* Nutritional Info for the Recipe */}
                    {recipe.nutritionalInfo && renderNutritionalInfo(recipe.nutritionalInfo, "Recipe Nutritional Info (Per Serving)")}

                    {/* Original Nutritional Info from Photo */}
                    {recipe.originalNutritionalInfo && (recipe.originalNutritionalInfo.calories !== "N/A" || recipe.originalNutritionalInfo.protein !== "N/A") && ( // Show if not default
                        <div className="mt-4 p-4 border border-dashed rounded-md bg-secondary/10">
                             <h3 className="text-md font-semibold text-secondary-foreground mb-2 flex items-center gap-2">
                                <Info className="h-5 w-5" /> Initial Estimate from Photo
                             </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                                <div><strong className="block text-muted-foreground">Calories:</strong> {recipe.originalNutritionalInfo.calories}</div>
                                <div><strong className="block text-muted-foreground">Protein:</strong> {recipe.originalNutritionalInfo.protein}</div>
                                <div><strong className="block text-muted-foreground">Carbs:</strong> {recipe.originalNutritionalInfo.carbohydrates}</div>
                                <div><strong className="block text-muted-foreground">Fat:</strong> {recipe.originalNutritionalInfo.fat}</div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-semibold mb-3 text-primary">Ingredients</h2>
                        <ul className="list-disc list-inside space-y-1.5 text-foreground/90 bg-muted/20 p-4 rounded-md shadow-sm">
                            {recipe.ingredients.map((ingredient, idx) => <li key={idx} className="ml-4">{ingredient}</li>)}
                        </ul>
                         {recipe.originalIngredients && recipe.originalIngredients.length > 0 && (
                            <div className="mt-3">
                                <Badge variant="outline">Identified from photo: {recipe.originalIngredients.join(', ')}</Badge>
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
                            <ul className="list-disc list-inside space-y-1.5 text-foreground/90 bg-muted/20 p-4 rounded-md shadow-sm">
                                {recipe.tips.map((tip, index) => <li key={index} className="ml-4">{tip}</li>)}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
