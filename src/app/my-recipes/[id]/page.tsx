
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserRecipeById } from "@/services/user-recipes";
import type { SavedRecipe } from "@/types/recipe";
import Image from "next/image";
import {
    ImageOff,
    Loader2,
    Utensils,
    Activity,
    Info,
    ShoppingBasket,
    ListChecks,
    Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NutritionalInfoDisplay } from "@/components/nutritional-info-display";
import { RecipeMetaDisplay } from "@/components/recipe-meta-display";

export default function RecipeDetailPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !id) {
            if (!id) setLoading(false); // Ensure loading stops if ID is missing
            return;
        }

        setLoading(true);
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
            <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]"> {/* Adjusted height for global padding */}
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <div className="text-center text-lg">Please log in to view this recipe.</div>;
    }
    if (!recipe) {
        return <div className="text-center text-lg">Recipe not found or you do not have permission to view it.</div>;
    }

    return (
        <div className="w-full"> {/* Adjusted to remove redundant container/padding */}
            <Card className="w-full max-w-4xl mx-auto shadow-xl overflow-hidden bg-card">
                <CardHeader className="p-0">
                    {recipe.recipeImage ? (
                        <div className="relative w-full aspect-[16/9] md:aspect-[2/1]">
                            <Image
                                src={recipe.recipeImage}
                                alt={recipe.recipeName}
                                fill // Changed from layout="fill" objectFit="cover"
                                style={{ objectFit: "cover" }}
                                className="bg-muted"
                                data-ai-hint="recipe cooked dish"
                                priority // Consider adding priority if it's LCP
                            />
                        </div>
                    ) : (
                        <div className="aspect-[16/9] md:aspect-[2/1] w-full flex items-center justify-center bg-muted" data-ai-hint="recipe placeholder">
                            <ImageOff className="h-24 w-24 text-muted-foreground" />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center gap-3">
                            <Utensils className="h-8 w-8 md:h-9 md:w-9" /> {recipe.recipeName}
                        </h1>
                        {recipe.originalDishType && (
                            <Badge variant="secondary" className="text-sm">{recipe.originalDishType}</Badge>
                        )}
                    </div>

                    <RecipeMetaDisplay
                        prepTime={recipe.prepTime}
                        cookTime={recipe.cookTime}
                        servings={recipe.servings}
                    />
                    
                    {recipe.nutritionalInfo && (
                        <NutritionalInfoDisplay
                            nutritionalInfo={recipe.nutritionalInfo}
                            title="Recipe Nutritional Info (Per Serving)"
                            icon={<Activity className="h-6 w-6" />}
                            titleClassName="text-2xl text-green-500" // Retain original title style from this page
                        />
                    )}

                    {recipe.originalNutritionalInfo && (recipe.originalNutritionalInfo.calories !== "N/A" || recipe.originalNutritionalInfo.protein !== "N/A") && (
                         <div className="mt-6 p-4 border border-dashed border-input rounded-lg bg-secondary/5">
                            <NutritionalInfoDisplay
                                nutritionalInfo={recipe.originalNutritionalInfo}
                                title="Initial Estimate (from Photo)"
                                icon={<Info className="h-5 w-5" />}
                                titleClassName="text-lg text-secondary-foreground"
                            />
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-semibold mb-3 text-orange-500 flex items-center gap-2">
                            <ShoppingBasket className="h-6 w-6" /> Ingredients
                        </h2>
                        <ul className="list-disc list-inside space-y-1.5 text-foreground/90 bg-muted/30 p-4 rounded-lg shadow">
                            {recipe.ingredients.map((ingredient, idx) => <li key={idx} className="ml-4">{ingredient}</li>)}
                        </ul>
                        {recipe.originalIngredients && recipe.originalIngredients.length > 0 && (
                            <div className="mt-3">
                                <Badge variant="outline">Identified from photo: {recipe.originalIngredients.join(', ')}</Badge>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-3 text-emerald-500 flex items-center gap-2">
                            <ListChecks className="h-6 w-6" /> Instructions
                        </h2>
                        <ol className="list-decimal list-inside space-y-3 text-foreground/90 bg-muted/30 p-4 rounded-lg shadow">
                            {recipe.instructions.map((instruction, idx) => <li key={idx} className="ml-4 leading-relaxed">{instruction}</li>)}
                        </ol>
                    </div>

                    {recipe.tips && recipe.tips.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-3 text-rose-500 flex items-center gap-2">
                                <Lightbulb className="h-6 w-6" /> Tips & Variations
                            </h2>
                            <ul className="list-disc list-inside space-y-1.5 text-foreground/90 bg-muted/30 p-4 rounded-lg shadow">
                                {recipe.tips.map((tip, index) => <li key={index} className="ml-4">{tip}</li>)}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
