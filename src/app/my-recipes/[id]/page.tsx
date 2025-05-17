
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
    Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
            if (!id) setLoading(false); 
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
            <div className="flex justify-center items-center min-h-[calc(100vh-16rem)] w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <div className="text-center text-lg w-full">Please log in to view this recipe.</div>;
    }
    if (!recipe) {
        return <div className="text-center text-lg w-full">Recipe not found or you do not have permission to view it.</div>;
    }

    const TipsSection = () => (
        recipe.tips && recipe.tips.length > 0 ? (
            <div>
                <h2 className="text-2xl font-semibold mb-3 text-accent flex items-center gap-2">
                    <Lightbulb className="h-6 w-6" /> Tips & Variations
                </h2>
                <ul className="list-disc list-inside space-y-1.5 text-foreground/90 bg-muted/30 p-4 rounded-lg shadow">
                    {recipe.tips!.map((tip, index) => <li key={index} className="ml-4">{tip}</li>)}
                </ul>
            </div>
        ) : null
    );

    return (
        <div className="w-full flex justify-center"> 
            <Card className="w-full shadow-xl overflow-hidden bg-card">
                <CardContent className="p-6 md:p-8 space-y-6">
                    {/* Title and Badge */}
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center gap-3">
                            <Utensils className="h-8 w-8 md:h-9 md:w-9" /> {recipe.recipeName}
                        </h1>
                        {recipe.originalDishType && (
                             <p className="text-md text-muted-foreground">
                                Here's your custom-generated recipe and its nutritional information! Original dish type: <Badge variant="secondary" className="text-sm ml-1">{recipe.originalDishType}</Badge>
                             </p>
                        )}
                         {!recipe.originalDishType && (
                             <p className="text-md text-muted-foreground">
                                Here's your custom-generated recipe and its nutritional information!
                             </p>
                        )}
                    </div>

                    {/* Grid for two-column layout on larger screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12 gap-y-8">
                        {/* Left Column */}
                        <div className="lg:col-span-4 space-y-6">
                            {recipe.recipeImage ? (
                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-md">
                                    <Image
                                        src={recipe.recipeImage}
                                        alt={recipe.recipeName}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        className="bg-muted"
                                        data-ai-hint="recipe cooked dish"
                                        priority 
                                    />
                                </div>
                            ) : (
                                <div className="aspect-[4/3] w-full flex items-center justify-center bg-muted rounded-lg shadow-md" data-ai-hint="recipe placeholder">
                                    <ImageOff className="h-24 w-24 text-muted-foreground" />
                                </div>
                            )}
                            
                            <RecipeMetaDisplay
                                prepTime={recipe.prepTime}
                                cookTime={recipe.cookTime}
                                servings={recipe.servings}
                            />
                            
                            {recipe.originalNutritionalInfo && (recipe.originalNutritionalInfo.calories !== "N/A" || recipe.originalNutritionalInfo.protein !== "N/A") && (
                                 <div className="p-4 border border-input rounded-lg bg-secondary/10">
                                    <NutritionalInfoDisplay
                                        nutritionalInfo={recipe.originalNutritionalInfo}
                                        title="Initial Estimate (from Photo)"
                                        icon={<Info className="h-5 w-5" />}
                                        titleClassName="text-lg text-secondary font-semibold"
                                        showDataBackground={false}
                                    />
                                </div>
                            )}
                            {/* Tips Section for Desktop */}
                            <div className="hidden lg:block">
                                <TipsSection />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-8 space-y-6">
                            {recipe.nutritionalInfo && (
                                <NutritionalInfoDisplay
                                    nutritionalInfo={recipe.nutritionalInfo}
                                    title="Recipe Nutritional Info (Per Serving)"
                                    icon={<Activity className="h-6 w-6" />}
                                    titleClassName="text-secondary text-2xl"
                                    showDataBackground={true} 
                                />
                            )}

                            <div>
                                <h2 className="text-2xl font-semibold mb-3 text-[hsl(var(--chart-3))] flex items-center gap-2">
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
                                <h2 className="text-2xl font-semibold mb-3 text-[hsl(var(--chart-4))] flex items-center gap-2">
                                    <ListChecks className="h-6 w-6" /> Instructions
                                </h2>
                                <ol className="list-decimal list-inside space-y-3 text-foreground/90 bg-muted/30 p-4 rounded-lg shadow">
                                    {recipe.instructions.map((instruction, idx) => <li key={idx} className="ml-4 leading-relaxed">{instruction}</li>)}
                                </ol>
                            </div>
                            {/* Tips Section for Mobile */}
                            <div className="lg:hidden">
                                <TipsSection />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
