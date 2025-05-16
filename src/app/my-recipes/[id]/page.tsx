"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserRecipeById } from "@/services/user-recipes";
import type { SavedRecipe } from "@/types/recipe";

export default function RecipePage() {
    const { user } = useAuth();
    const { id } = useParams();
    const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !id) return;

        getUserRecipeById(user.uid, id as string)
            .then(setRecipe)
            .catch(() => setRecipe(null))
            .finally(() => setLoading(false));
    }, [user, id]);

    if (!user) return <div className="p-6 text-center">Please log in to view the recipe.</div>;
    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!recipe) return <div className="p-6 text-center">Recipe not found.</div>;

    return (
        <>
            <div className="flex flex-col md:flex-row items-start justify-around gap-x-16 p-8 md:px-0 md:py-10">
                <div className="flex flex-col justify-center items-center">
                    {recipe.recipeImage && (
                        <img src={recipe.recipeImage} alt={recipe.recipeName} className="rounded-md w-full max-w-xl mb-6" />
                    )}
                </div>
                <div className="bg-white p-6 rounded-md shadow-md">
                    <h1 className="text-3xl font-bold mb-4 italic">
                        <span className="text-black not-italic">Original dish type:</span>
                        <br />
                        {recipe.recipeName}
                    </h1>
                    <h2 className="font-semibold text-lg mb-2">Ingredients</h2>
                    <ul className="list-disc list-inside text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-md">
                        {recipe.ingredients.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                </div>
            </div>
            <div className="bg-white p-6 rounded-md shadow-md">
                <h2 className="font-semibold text-lg mb-2">Instructions</h2>
                <ol className="list-decimal list-inside text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-md">
                    {recipe.instructions.map((i, idx) => <li key={idx}>{i}</li>)}
                </ol>
            </div>
            <div className="bg-white p-6 rounded-md shadow-md">
                <h2 className="font-semibold text-lg mb-2">Tips of the Dish</h2>
                <p className="text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-md">{recipe.tips}</p>
            </div>
            <div className='flex flex-col gap-2 justify-start items-start'>
                {recipe.prepTime && (
                    <div className='flex flex-col sm:flex-row gap-2 md:justify-center md:items-center'>
                        <h3 className="text-xl font-semibold mb-2 text-primary">Preparation Time:</h3>
                        <p className="text-foreground/90">{recipe.prepTime}</p>
                    </div>
                )}
                {recipe.cookTime && (
                    <div className='flex flex-col sm:flex-row gap-2 md:justify-center md:items-center'>
                        <h3 className="text-xl font-semibold mb-2 text-primary">Cooking Time:</h3>
                        <p className="text-foreground/90">{recipe.cookTime}</p>
                    </div>
                )}
                {recipe.servings && (
                    <div className='flex flex-col sm:flex-row gap-2 md:justify-center md:items-center'>
                        <h3 className="text-xl font-semibold mb-2 text-primary">Servings:</h3>
                        <p className="text-foreground/90">{recipe.servings}</p>
                    </div>
                )}
            </div>
        </>
    );
}
