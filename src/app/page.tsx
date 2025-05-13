"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
// Textarea removed as it's not used in this component. Re-add if needed.
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { identifyIngredients, type IdentifyIngredientsOutput } from '@/ai/flows/identify-ingredients';
import { generateRecipe, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { UploadCloud, ChefHat, Utensils, Loader2, X, Plus, AlertTriangle, Wand2, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { saveUserRecipe } from '@/services/user-recipes';

type AppStep = 'upload' | 'edit' | 'recipe';

export default function SnapRecipePage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImageDataUri, setUploadedImageDataUri] = useState<string | null>(null);
  
  const [identifiedData, setIdentifiedData] = useState<IdentifyIngredientsOutput | null>(null);
  const [editableIngredients, setEditableIngredients] = useState<string[]>([]);
  const [editableDishType, setEditableDishType] = useState<string>('');
  
  const [recipeData, setRecipeData] = useState<GenerateRecipeOutput | null>(null);
  
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setUploadedImageFile(file);
      try {
        const dataUri = await fileToDataUri(file);
        setUploadedImageDataUri(dataUri);
      } catch (err) {
        console.error("Error converting file to data URI:", err);
        setError("Failed to load image. Please try another file.");
        toast({
          variant: "destructive",
          title: "Image Load Error",
          description: "Failed to load image. Please try another file.",
        });
        setUploadedImageDataUri(null);
        setUploadedImageFile(null);
      }
    }
  };

  const handleIdentifyIngredients = async () => {
    if (!uploadedImageDataUri) {
      setError("Please upload an image first.");
      toast({ variant: "destructive", title: "Error", description: "Please upload an image first." });
      return;
    }
    setIsLoadingIngredients(true);
    setError(null);
    try {
      const result = await identifyIngredients({ photoDataUri: uploadedImageDataUri });
      setIdentifiedData(result);
      setEditableIngredients(result.ingredients || []);
      setEditableDishType(result.dishType || '');
      setCurrentStep('edit');
      toast({ title: "Ingredients Identified!", description: "Review and adjust the ingredients and dish type." });
    } catch (err) {
      console.error("Error identifying ingredients:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during ingredient identification.";
      setError(`Failed to identify ingredients: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Identification Error",
        description: `Failed to identify ingredients: ${errorMessage.substring(0,100)}`,
      });
    } finally {
      setIsLoadingIngredients(false);
    }
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...editableIngredients];
    newIngredients[index] = value;
    setEditableIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setEditableIngredients([...editableIngredients, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    setEditableIngredients(editableIngredients.filter((_, i) => i !== index));
  };

  const handleGenerateRecipe = async () => {
    if (editableIngredients.length === 0 || !editableDishType) {
      setError("Please ensure there are ingredients and a dish type specified.");
      toast({ variant: "destructive", title: "Error", description: "Please provide ingredients and a dish type." });
      return;
    }
    setIsLoadingRecipe(true);
    setError(null);
    try {
      const result = await generateRecipe({ ingredients: editableIngredients.filter(ing => ing.trim() !== ''), dishType: editableDishType });
      setRecipeData(result);
      setCurrentStep('recipe');
      toast({ title: "Recipe Generated!", description: "Enjoy your custom recipe!" });
    } catch (err) {
      console.error("Error generating recipe:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during recipe generation.";
      setError(`Failed to generate recipe: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Recipe Generation Error",
        description: `Failed to generate recipe: ${errorMessage.substring(0,100)}`,
      });
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!user || !recipeData) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in and have a recipe generated to save." });
      return;
    }
    setIsSavingRecipe(true);
    try {
      // saveUserRecipe now throws an error on failure, so recipeId will be a string if successful.
      const recipeId = await saveUserRecipe(
        user.uid,
        recipeData,
        uploadedImageDataUri || undefined,
        identifiedData?.ingredients || [],
        identifiedData?.dishType || ''
      );
      // If saveUserRecipe was successful, recipeId will be valid.
      toast({ title: "Recipe Saved!", description: `Your recipe (ID: ${recipeId.substring(0,6)}...) has been added to your collection.` });
    } catch (err) {
      console.error("Error saving recipe:", err); // Log the actual error caught from saveUserRecipe
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while saving.";
      toast({
        variant: "destructive",
        title: "Save Error",
        description: `Failed to save recipe: ${errorMessage.substring(0,150)}`, // Show more of the error
      });
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setUploadedImageFile(null);
    setUploadedImageDataUri(null);
    setIdentifiedData(null);
    setEditableIngredients([]);
    setEditableDishType('');
    setRecipeData(null);
    setError(null);
  };
  
  const AccentButton = (props: React.ComponentProps<typeof Button>) => (
    <Button {...props} className={`bg-accent text-accent-foreground hover:bg-accent/90 ${props.className}`} />
  );

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center space-y-8">
      {error && (
        <Alert variant="destructive" className="w-full max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentStep === 'upload' && (
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl"><UploadCloud className="h-7 w-7 text-primary" /> Upload Food Photo</CardTitle>
            <CardDescription>Take a picture of your food or upload an image to identify ingredients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="text-base" />
            {uploadedImageDataUri && (
              <div className="mt-4 border rounded-md p-2 bg-muted/50">
                <Image 
                  src={uploadedImageDataUri} 
                  alt="Uploaded food" 
                  width={500} 
                  height={300} 
                  className="rounded-md object-contain mx-auto max-h-[300px] w-auto"
                  data-ai-hint="food photography"
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <AccentButton onClick={handleIdentifyIngredients} disabled={!uploadedImageFile || isLoadingIngredients} className="w-full">
              {isLoadingIngredients ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Identify Ingredients
            </AccentButton>
          </CardFooter>
        </Card>
      )}

      {currentStep === 'edit' && identifiedData && (
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl"><ChefHat className="h-7 w-7 text-primary" /> Review &amp; Adjust</CardTitle>
            <CardDescription>Correct the identified ingredients and dish type if needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {uploadedImageDataUri && (
              <div className="mb-4 border rounded-md p-2 bg-muted/50">
                <Image 
                  src={uploadedImageDataUri} 
                  alt="Uploaded food" 
                  width={500} 
                  height={300} 
                  className="rounded-md object-contain mx-auto max-h-[200px] w-auto"
                  data-ai-hint="food stillLife"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="dishType" className="text-lg font-semibold">Dish Type</Label>
              <Input 
                id="dishType" 
                value={editableDishType} 
                onChange={(e) => setEditableDishType(e.target.value)}
                placeholder="e.g., Salad, Soup, Pasta"
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Ingredients</h3>
              {editableIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    value={ingredient} 
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder="e.g., Tomato, 1 cup"
                    className="text-base flex-grow"
                  />
                  <Button variant="outline" size="icon" onClick={() => handleRemoveIngredient(index)} aria-label="Remove ingredient">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddIngredient} className="w-full border-dashed">
                <Plus className="mr-2 h-4 w-4" /> Add Ingredient
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto">Start Over</Button>
            <AccentButton onClick={handleGenerateRecipe} disabled={isLoadingRecipe} className="w-full sm:flex-grow">
              {isLoadingRecipe ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Utensils className="mr-2 h-4 w-4" />}
              Generate Recipe
            </AccentButton>
          </CardFooter>
        </Card>
      )}

      {currentStep === 'recipe' && recipeData && (
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl"><Utensils className="h-7 w-7 text-primary" /> {recipeData.recipeName}</CardTitle>
            <CardDescription>Here&apos;s your custom-generated recipe!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Ingredients:</h3>
              <ul className="list-disc list-inside space-y-1 pl-2 bg-muted/30 p-4 rounded-md">
                {recipeData.ingredients.map((item, index) => (
                  <li key={index} className="text-foreground/90">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 pl-2 bg-muted/30 p-4 rounded-md">
                {recipeData.instructions.map((step, index) => (
                  <li key={index} className="text-foreground/90 leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto">
              Create Another
            </Button>
            {user && (
              <AccentButton onClick={handleSaveRecipe} disabled={isSavingRecipe} className="w-full sm:flex-grow">
                {isSavingRecipe ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Recipe
              </AccentButton>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
