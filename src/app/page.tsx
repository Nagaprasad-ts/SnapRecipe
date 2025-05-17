
"use client";

import { useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { identifyIngredients, type IdentifyIngredientsOutput } from '@/ai/flows/identify-ingredients';
import { generateRecipe, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { generateRecipeImage, type GenerateRecipeImageOutput } from '@/ai/flows/generate-recipe-image'; // Added
import { UploadCloud, ChefHat, Utensils, Loader2, X, Plus, AlertTriangle, Wand2, Save, Activity, ShoppingBasket, ListChecks, Lightbulb, Info, ImageOff } from 'lucide-react'; // Added ImageOff
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { saveUserRecipe } from '@/services/user-recipes';
import { NutritionalInfoDisplay } from '@/components/nutritional-info-display';
import { RecipeMetaDisplay } from '@/components/recipe-meta-display';
import { AccentButton } from '@/components/ui/accent-button';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

type AppStep = 'upload' | 'edit' | 'recipe';

export default function SnapRecipePage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImageDataUri, setUploadedImageDataUri] = useState<string | null>(null);
  const [generatedRecipeImageUri, setGeneratedRecipeImageUri] = useState<string | null>(null); // Added

  const [identifiedData, setIdentifiedData] = useState<IdentifyIngredientsOutput | null>(null);
  const [editableIngredients, setEditableIngredients] = useState<string[]>([]);
  const [editableDishType, setEditableDishType] = useState<string>('');

  const [recipeData, setRecipeData] = useState<GenerateRecipeOutput | null>(null);

  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false); // Added
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
      setGeneratedRecipeImageUri(null); // Clear any previously generated image
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
      toast({ title: "Ingredients Identified!", description: "Review and adjust the ingredients, dish type, and see initial nutritional estimates." });
    } catch (err) {
      console.error("Error identifying ingredients:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during ingredient identification.";
      setError("Failed to identify ingredients: " + errorMessage);
      toast({
        variant: "destructive",
        title: "Identification Error",
        description: "Failed to identify ingredients: " + errorMessage.substring(0, 100),
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
    setGeneratedRecipeImageUri(null); // Clear previous image before generating new recipe text
    setError(null);
    try {
      const result = await generateRecipe({ ingredients: editableIngredients.filter(ing => ing.trim() !== ''), dishType: editableDishType });
      setRecipeData(result);
      setCurrentStep('recipe');
      toast({ title: "Recipe Generated!", description: "Enjoy your custom recipe and its nutritional details!" });

      if (!uploadedImageDataUri && result.recipeName) { // If no user image, and recipe has a name, generate one
        setIsGeneratingImage(true);
        try {
          const imageResult = await generateRecipeImage({ recipeName: result.recipeName });
          setGeneratedRecipeImageUri(imageResult.imageDataUri);
          toast({ title: "Recipe Image Generated!", description: "An image for your recipe has been created."});
        } catch (imgErr) {
          console.error("Error generating recipe image:", imgErr);
          const imgErrMsg = imgErr instanceof Error ? imgErr.message : "Unknown image generation error.";
          toast({ variant: "destructive", title: "Image Generation Error", description: "Could not generate an image for the recipe: " + imgErrMsg.substring(0,100) });
        } finally {
          setIsGeneratingImage(false);
        }
      }

    } catch (err) {
      console.error("Error generating recipe:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during recipe generation.";
      setError("Failed to generate recipe: " + errorMessage);
      toast({
        variant: "destructive",
        title: "Recipe Generation Error",
        description: "Failed to generate recipe: " + errorMessage.substring(0, 100),
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
    const imageToSave = uploadedImageDataUri || generatedRecipeImageUri;

    try {
      await saveUserRecipe(
        user.uid,
        recipeData,
        imageToSave || undefined,
        identifiedData || undefined
      );
      toast({ title: "Recipe Saved!", description: "Your recipe (" + recipeData.recipeName + ") has been added to your collection." });
    } catch (err) {
      console.error("[handleSaveRecipe] Error caught while saving recipe:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while saving.";
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save recipe: " + errorMessage + ". Check console for details.",
      });
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setUploadedImageFile(null);
    setUploadedImageDataUri(null);
    setGeneratedRecipeImageUri(null); // Reset generated image
    setIdentifiedData(null);
    setEditableIngredients([]);
    setEditableDishType('');
    setRecipeData(null);
    setError(null);
    setIsLoadingIngredients(false);
    setIsLoadingRecipe(false);
    setIsGeneratingImage(false);
    setIsSavingRecipe(false);
  };

  const TipsSectionContent = () => (
    recipeData && recipeData.tips && recipeData.tips.length > 0 ? (
        <div>
            <h3 className="text-xl font-semibold mb-3 text-accent flex items-center gap-2">
                <Lightbulb className="h-6 w-6" />Tips &amp; Variations:
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-foreground/90 bg-muted/30 p-4 rounded-lg shadow">
                {recipeData.tips.map((tip, index) => (
                    <li key={index} className="ml-4 leading-relaxed">{tip}</li>
                ))}
            </ul>
        </div>
    ) : null
  );


  return (
    <div className="flex flex-col items-center w-full">
      {error && (
        <div className="w-full">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {currentStep === 'upload' && (
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-primary"><UploadCloud className="h-7 w-7" /> Upload Food Photo</CardTitle>
            <CardDescription>Upload an image to identify ingredients and get an initial nutritional estimate. Or, skip and type ingredients later.</CardDescription>
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
          <CardFooter className="flex flex-col sm:flex-row gap-2">
             <Button variant="outline" onClick={() => { setUploadedImageDataUri(null); setUploadedImageFile(null); setCurrentStep('edit'); }} className="w-full sm:w-auto">
              Skip Photo & Type Ingredients
            </Button>
            <AccentButton onClick={handleIdentifyIngredients} disabled={!uploadedImageFile || isLoadingIngredients} className="w-full sm:flex-grow">
              {isLoadingIngredients ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Identify From Photo
            </AccentButton>
          </CardFooter>
        </Card>
      )}

      {currentStep === 'edit' && ( // identifiedData might be null if user skipped photo
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-primary"><ChefHat className="h-7 w-7" /> Review &amp; Adjust</CardTitle>
            <CardDescription>
              {uploadedImageDataUri ? "Correct ingredients, dish type, and review initial nutritional estimates from your photo." : "Enter your ingredients and desired dish type."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12 gap-y-8">
              {/* Left Column: Image and Initial Nutrients */}
              <div className="lg:col-span-4 space-y-6">
                {uploadedImageDataUri && (
                  <div className="mb-4 border rounded-md p-2 bg-muted/50">
                    <Image
                      src={uploadedImageDataUri}
                      alt="Uploaded food"
                      width={500}
                      height={300}
                      className="rounded-md object-contain mx-auto max-h-[250px] lg:max-h-[300px] w-auto"
                      data-ai-hint="food stillLife"
                    />
                  </div>
                )}
                {identifiedData?.nutritionalInfo && (
                  <NutritionalInfoDisplay
                    nutritionalInfo={identifiedData.nutritionalInfo}
                    title="Estimated Nutrients (from Photo)"
                    icon={<Info className="h-6 w-6" />}
                    titleClassName="text-secondary text-xl"
                    showDataBackground={false}
                  />
                )}
                 {!uploadedImageDataUri && (
                  <div className="aspect-[4/3] w-full flex items-center justify-center bg-muted rounded-lg shadow-md" data-ai-hint="ingredient list empty state">
                     <ShoppingBasket className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Right Column: Dish Type and Ingredients */}
              <div className="lg:col-span-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dishType" className="text-lg font-semibold text-primary">Dish Type</Label>
                  <Input
                    id="dishType"
                    value={editableDishType}
                    onChange={(e) => setEditableDishType(e.target.value)}
                    placeholder="e.g., Stir-fry, Quick weeknight pasta, Hearty soup"
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[hsl(var(--chart-3))] mb-2">Ingredients</h3>
                  {editableIngredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        placeholder="e.g., Chicken breast, 1 lb"
                        className="text-base flex-grow"
                      />
                      <Button variant="outline" size="icon" onClick={() => handleRemoveIngredient(index)} aria-label="Remove ingredient">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                   {editableIngredients.length === 0 && <p className="text-sm text-muted-foreground">No ingredients added yet. Click below to add some!</p>}
                  <Button variant="outline" onClick={handleAddIngredient} className="w-full border-dashed mt-3">
                    <Plus className="mr-2 h-4 w-4" /> Add Ingredient
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6">
            <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto">Start Over</Button>
            <AccentButton onClick={handleGenerateRecipe} disabled={isLoadingRecipe || editableIngredients.length === 0 || !editableDishType.trim()} className="w-full sm:flex-grow">
              {isLoadingRecipe ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Utensils className="mr-2 h-4 w-4" />}
              Generate Recipe &amp; Nutrients
            </AccentButton>
          </CardFooter>
        </Card>
      )}

      {currentStep === 'recipe' && recipeData && (
        <Card className="w-full shadow-xl">
          <CardHeader className="text-center lg:text-left">
            <CardTitle className="flex items-center justify-center lg:justify-start gap-3 text-2xl md:text-3xl font-bold text-primary">
              <Utensils className="h-7 w-7 md:h-8 md:w-8" /> {recipeData.recipeName}
            </CardTitle>
            <CardDescription>Here&apos;s your custom-generated recipe and its nutritional information!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-justify">
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12 gap-y-8">
              {/* Left Column */}
              <div className="lg:col-span-4 space-y-8">
                <div className="border rounded-md p-2 bg-muted/50">
                  {uploadedImageDataUri ? (
                    <Image
                      src={uploadedImageDataUri}
                      alt="Original food item that inspired the recipe"
                      width={500}
                      height={300}
                      className="rounded-md object-contain mx-auto max-h-[250px] lg:max-h-[300px] w-auto"
                      data-ai-hint="food photography source"
                    />
                  ) : isGeneratingImage ? (
                    <div className="aspect-[4/3] w-full flex flex-col items-center justify-center bg-muted rounded-lg">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
                      <p className="text-muted-foreground">Generating recipe image...</p>
                    </div>
                  ) : generatedRecipeImageUri ? (
                    <Image
                      src={generatedRecipeImageUri}
                      alt={recipeData.recipeName || "Generated recipe image"}
                      width={500}
                      height={300}
                      className="rounded-md object-contain mx-auto max-h-[250px] lg:max-h-[300px] w-auto"
                      data-ai-hint="recipe delicious food"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full flex items-center justify-center bg-muted rounded-lg" data-ai-hint="recipe placeholder cooking">
                      <ImageOff className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <RecipeMetaDisplay
                  prepTime={recipeData.prepTime}
                  cookTime={recipeData.cookTime}
                  servings={recipeData.servings}
                />
                 {identifiedData?.nutritionalInfo && (recipeData.nutritionalInfo.calories !== "N/A" || recipeData.nutritionalInfo.protein !== "N/A") && (
                  <div className="p-4 border border-dashed border-input rounded-lg bg-secondary/10">
                    <NutritionalInfoDisplay
                      nutritionalInfo={identifiedData.nutritionalInfo}
                      title="Initial Estimate (from Photo)"
                      icon={<Info className="h-5 w-5" />}
                      titleClassName="text-lg text-secondary"
                      showDataBackground={false}
                    />
                  </div>
                )}
                {/* Tips for DESKTOP */}
                <div className="hidden lg:block">
                    <TipsSectionContent />
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-8 space-y-8">
                {recipeData.nutritionalInfo && (
                  <NutritionalInfoDisplay
                    nutritionalInfo={recipeData.nutritionalInfo}
                    title="Recipe Nutritional Info (Per Serving)"
                    icon={<Activity className="h-6 w-6" />}
                    titleClassName="text-secondary text-2xl"
                    showDataBackground={true}
                  />
                )}
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-[hsl(var(--chart-3))] flex items-center gap-2">
                    <ShoppingBasket className="h-6 w-6" />Ingredients:
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 text-foreground/90 bg-muted/30 p-4 rounded-lg shadow">
                    {recipeData.ingredients.map((item, index) => (
                      <li key={index} className="ml-4 leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-[hsl(var(--chart-4))] flex items-center gap-2">
                    <ListChecks className="h-6 w-6" />Instructions:
                  </h3>
                  <ol className="list-decimal list-inside space-y-3 text-foreground/90 bg-muted/30 p-4 rounded-lg shadow">
                    {recipeData.instructions.map((step, index) => (
                      <li key={index} className="ml-4 leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
                {/* Tips for MOBILE */}
                <div className="lg:hidden">
                    <TipsSectionContent />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6">
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
