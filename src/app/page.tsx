
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { identifyIngredients, type IdentifyIngredientsOutput } from '@/ai/flows/identify-ingredients';
import { generateRecipe, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { generateRecipeImage, type GenerateRecipeImageOutput } from '@/ai/flows/generate-recipe-image';
import { UploadCloud, ChefHat, Utensils, Loader2, X, Plus, AlertTriangle, Wand2, Save, Activity, ShoppingBasket, ListChecks, Lightbulb, Info, ImageOff, ClipboardList, Edit3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { saveUserRecipe } from '@/services/user-recipes';
import { NutritionalInfoDisplay } from '@/components/nutritional-info-display';
import { RecipeMetaDisplay } from '@/components/recipe-meta-display';
import { AccentButton } from '@/components/ui/accent-button';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { ShoppingListDialog } from '@/components/shopping-list-dialog';
import type { UserPreferences } from '@/types/user';
import { getUserPreferences } from '@/services/user-profile';

type AppStep = 'upload' | 'edit' | 'recipe';

const MAX_IMAGE_DATA_URI_STRING_LENGTH = 750 * 1024; // Approx 560KB binary data for the Data URI string
const MAX_RAW_IMAGE_SIZE_BYTES = 500 * 1024; // 500KB limit for the raw file

export default function SnapRecipePage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null); // Retain for potential direct use if not compressed
  const [uploadedImageDataUri, setUploadedImageDataUri] = useState<string | null>(null);
  const [generatedRecipeImageUri, setGeneratedRecipeImageUri] = useState<string | null>(null);

  const [identifiedData, setIdentifiedData] = useState<IdentifyIngredientsOutput | null>(null);
  const [editableIngredients, setEditableIngredients] = useState<string[]>([]);
  const [editableDishType, setEditableDishType] = useState<string>('');

  const [recipeData, setRecipeData] = useState<GenerateRecipeOutput | null>(null);
  const [tweakRequestInput, setTweakRequestInput] = useState<string>('');

  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [isTweakingRecipe, setIsTweakingRecipe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (user && user.uid) {
      getUserPreferences(user.uid)
        .then(prefs => {
          if (prefs) {
            setUserPreferences(prefs);
          }
        })
        .catch(err => {
          console.error("Failed to load user preferences on homepage:", err);
        });
    } else {
      setUserPreferences(null);
    }
  }, [user]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // Max width for compressed image
        const MAX_HEIGHT = 1024; // Max height for compressed image
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error("Failed to get canvas context"));
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Use image/jpeg for better compression for photos, quality 0.7-0.8 is a good balance
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75); 
        URL.revokeObjectURL(img.src); // Clean up object URL
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(img.src); // Clean up object URL
        reject(err);
      };
      img.src = URL.createObjectURL(file);
    });
  };


  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setGeneratedRecipeImageUri(null);
      setUploadedImageDataUri(null); // Reset previous image
      setUploadedImageFile(file); // Store original file temporarily

      if (file.size > MAX_RAW_IMAGE_SIZE_BYTES) {
        toast({
          title: "Image is Large",
          description: "Attempting to compress the image. This may take a moment...",
        });
        try {
          const compressedDataUri = await compressImage(file);
          if (compressedDataUri.length > MAX_IMAGE_DATA_URI_STRING_LENGTH) {
            setError("Compressed image is still too large (over ~560KB data URI). Please choose a smaller file or one that compresses better.");
            toast({
              variant: "destructive",
              title: "Compression Failed",
              description: "Compressed image is still too large. Max data URI size is ~750KB.",
            });
            setUploadedImageDataUri(null);
            setUploadedImageFile(null);
            event.target.value = ''; // Clear the file input
            return;
          }
          setUploadedImageDataUri(compressedDataUri);
          toast({
            title: "Image Compressed",
            description: "Image successfully compressed and loaded.",
          });
        } catch (compressErr) {
          console.error("Error compressing image:", compressErr);
          setError("Failed to compress image. Please try another file.");
          toast({
            variant: "destructive",
            title: "Compression Error",
            description: "Failed to compress image. Please try another file.",
          });
          setUploadedImageDataUri(null);
          setUploadedImageFile(null);
          event.target.value = '';
        }
      } else {
        // File is within raw size limits, convert to data URI and check data URI length
        try {
          const dataUri = await fileToDataUri(file);
          if (dataUri.length > MAX_IMAGE_DATA_URI_STRING_LENGTH) {
            setError("Image data is too large after conversion (over ~560KB data URI), even if file size was small. Please try another image.");
            toast({
              variant: "destructive",
              title: "Image Data Too Large",
              description: "Image data URI is too large. Max data URI size is ~750KB.",
            });
            setUploadedImageDataUri(null);
            setUploadedImageFile(null);
            event.target.value = '';
            return;
          }
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
          event.target.value = '';
        }
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

  const handleGenerateNewRecipe = async () => {
    if (editableIngredients.filter(ing => ing.trim() !== '').length === 0 || !editableDishType.trim()) {
      setError("Please ensure there are ingredients and a dish type specified.");
      toast({ variant: "destructive", title: "Error", description: "Please provide ingredients and a dish type." });
      return;
    }
    setIsLoadingRecipe(true);
    setGeneratedRecipeImageUri(null); // Reset any previously generated AI image for a new recipe
    setError(null);
    try {
      const recipeInput: any = {
        ingredients: editableIngredients.filter(ing => ing.trim() !== ''),
        dishType: editableDishType.trim()
      };

      if (user && userPreferences) {
        if (userPreferences.dietaryRestrictions && userPreferences.dietaryRestrictions.length > 0) {
          recipeInput.dietaryRestrictions = userPreferences.dietaryRestrictions;
        }
        if (userPreferences.preferredCuisines && userPreferences.preferredCuisines.length > 0) {
          recipeInput.preferredCuisines = userPreferences.preferredCuisines;
        }
      }

      const result = await generateRecipe(recipeInput);
      setRecipeData(result);
      setCurrentStep('recipe');
      toast({ title: "Recipe Generated!", description: "Enjoy your custom recipe and its nutritional details!" });

      // Only generate AI image if no user-uploaded image is present.
      if (!uploadedImageDataUri && result.recipeName) {
        setIsGeneratingImage(true);
        try {
          const imageResult = await generateRecipeImage({ recipeName: result.recipeName });
          if (imageResult.imageDataUri.length > MAX_IMAGE_DATA_URI_STRING_LENGTH) {
            toast({ variant: "destructive", title: "AI Image Too Large", description: "AI-generated image was too large to display and save. Proceeding without it." });
            setGeneratedRecipeImageUri(null);
          } else {
            setGeneratedRecipeImageUri(imageResult.imageDataUri);
            toast({ title: "Recipe Image Generated!", description: "An image for your recipe has been created." });
          }
        } catch (imgErr) {
          console.error("Error generating recipe image:", imgErr);
          const imgErrMsg = imgErr instanceof Error ? imgErr.message : "Unknown image generation error.";
          toast({ variant: "destructive", title: "Image Generation Error", description: "Could not generate an image for the recipe: " + imgErrMsg.substring(0, 100) });
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

  const handleApplyTweak = async () => {
    if (!recipeData || !tweakRequestInput.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a tweak instruction for the current recipe." });
      return;
    }
    setIsTweakingRecipe(true);
    setError(null);
    try {
      const tweakedRecipe = await generateRecipe({
        previousRecipeData: recipeData,
        tweakInstruction: tweakRequestInput.trim(),
      });
      setRecipeData(tweakedRecipe);
      setTweakRequestInput('');
      toast({ title: "Recipe Updated!", description: "The recipe has been modified based on your request." });

      // If there wasn't an original user-uploaded image, generate a new one for the tweaked recipe.
      // Or if an AI image was there, regenerate it for the new recipe name.
      if (!uploadedImageDataUri && tweakedRecipe.recipeName) {
        setIsGeneratingImage(true);
        setGeneratedRecipeImageUri(null); // Clear previous AI image
        try {
          const imageResult = await generateRecipeImage({ recipeName: tweakedRecipe.recipeName });
           if (imageResult.imageDataUri.length > MAX_IMAGE_DATA_URI_STRING_LENGTH) {
            toast({ variant: "destructive", title: "AI Image Too Large", description: "AI-generated image for tweaked recipe was too large. Proceeding without it." });
            setGeneratedRecipeImageUri(null);
          } else {
            setGeneratedRecipeImageUri(imageResult.imageDataUri);
            toast({ title: "New Recipe Image Generated!", description: "An image for your updated recipe has been created."});
          }
        } catch (imgErr) {
          console.error("Error generating new recipe image:", imgErr);
          const imgErrMsg = imgErr instanceof Error ? imgErr.message : "Unknown image generation error.";
          toast({ variant: "destructive", title: "Image Generation Error", description: "Could not generate a new image for the recipe: " + imgErrMsg.substring(0,100) });
        } finally {
          setIsGeneratingImage(false);
        }
      }
    } catch (err) {
      console.error("Error tweaking recipe:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during recipe tweaking.";
      setError("Failed to tweak recipe: " + errorMessage);
      toast({
        variant: "destructive",
        title: "Recipe Tweak Error",
        description: "Failed to tweak recipe: " + errorMessage.substring(0, 100),
      });
    } finally {
      setIsTweakingRecipe(false);
    }
  };


  const handleSaveRecipe = async () => {
    if (!user || !recipeData) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in and have a recipe generated to save." });
      return;
    }
    setIsSavingRecipe(true);
    
    // Prioritize user-uploaded (potentially compressed) image, then AI generated, then null
    let imageToSave = uploadedImageDataUri; 
    if (!imageToSave && generatedRecipeImageUri) {
        // Double check size for AI image here too before attempting to save
        if (generatedRecipeImageUri.length > MAX_IMAGE_DATA_URI_STRING_LENGTH) {
            toast({ variant: "destructive", title: "AI Image Too Large to Save", description: "The AI-generated image is too large and will not be saved with the recipe." });
            imageToSave = null; // Explicitly nullify if too large
        } else {
            imageToSave = generatedRecipeImageUri;
        }
    }


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
    setGeneratedRecipeImageUri(null);
    setIdentifiedData(null);
    setEditableIngredients([]);
    setEditableDishType('');
    setRecipeData(null);
    setTweakRequestInput('');
    setError(null);
    setIsLoadingIngredients(false);
    setIsLoadingRecipe(false);
    setIsGeneratingImage(false);
    setIsSavingRecipe(false);
    setIsTweakingRecipe(false);
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
    <div className="w-full py-6 md:py-8">
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
            <Input id="imageUpload" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="text-base" />
            <p className="text-sm text-muted-foreground">Recommended maximum image size: ~500KB (larger images will be compressed).</p>
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
            <AccentButton onClick={handleIdentifyIngredients} disabled={!uploadedImageDataUri || isLoadingIngredients} className="w-full sm:flex-grow">
              {isLoadingIngredients ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Identify From Photo
            </AccentButton>
          </CardFooter>
        </Card>
      )}

      {currentStep === 'edit' && (
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-primary"><ChefHat className="h-7 w-7" /> Review &amp; Adjust</CardTitle>
            <CardDescription>
              {uploadedImageDataUri ? "Correct ingredients, dish type, and review initial nutritional estimates from your photo." : "Enter your ingredients and desired dish type."}
              {user && userPreferences && (userPreferences.dietaryRestrictions.length > 0 || userPreferences.preferredCuisines.length > 0) && (
                <span className="block mt-1 text-sm text-accent">
                  Your preferences will be applied for new recipes:
                  {userPreferences.dietaryRestrictions.length > 0 && ` Restrictions (${userPreferences.dietaryRestrictions.join(", ")})`}
                  {userPreferences.preferredCuisines.length > 0 && ` Cuisines (${userPreferences.preferredCuisines.join(", ")})`}.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12 gap-y-8">

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
            <AccentButton onClick={handleGenerateNewRecipe} disabled={isLoadingRecipe || editableIngredients.filter(ing => ing.trim() !== '').length === 0 || !editableDishType.trim()} className="w-full sm:flex-grow">
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
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12 gap-y-8">
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
                 {identifiedData?.nutritionalInfo && (identifiedData.nutritionalInfo.calories !== "N/A" || identifiedData.nutritionalInfo.protein !== "N/A") && (
                  <div className="p-4 border border-dashed border-input rounded-lg bg-secondary/10">
                    <NutritionalInfoDisplay
                      nutritionalInfo={identifiedData.nutritionalInfo}
                      title="Initial Estimate (from Photo)"
                      icon={<Info className="h-5 w-5" />}
                      titleClassName="text-lg text-secondary font-semibold"
                      showDataBackground={false}
                    />
                  </div>
                )}
                <div className="hidden lg:block">
                    <TipsSectionContent />
                </div>
              </div>

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

                <div className="lg:hidden">
                    <TipsSectionContent />
                </div>

                <div className="pt-6 border-t border-border">
                    <h3 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                        <Edit3 className="h-6 w-6" /> Customize this Recipe
                    </h3>
                    <Textarea
                        placeholder="e.g., Make it vegetarian, add garlic, double the servings..."
                        value={tweakRequestInput}
                        onChange={(e) => setTweakRequestInput(e.target.value)}
                        className="mb-3 text-base"
                        rows={3}
                    />
                    <AccentButton
                        onClick={handleApplyTweak}
                        disabled={isTweakingRecipe || !tweakRequestInput.trim()}
                        className="w-full sm:w-auto"
                    >
                        {isTweakingRecipe ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Update Recipe
                    </AccentButton>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6 items-stretch">
            <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto">
              Create Another
            </Button>

            {user && (
              <ShoppingListDialog recipeName={recipeData.recipeName} ingredients={recipeData.ingredients}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ClipboardList className="mr-2 h-4 w-4" /> View Shopping List
                </Button>
              </ShoppingListDialog>
            )}

            {user && (
              <AccentButton onClick={handleSaveRecipe} disabled={isSavingRecipe} className="w-full sm:flex-grow">
                {isSavingRecipe ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Recipe
              </AccentButton>
            )}
            {!user && (
               <AccentButton onClick={() => toast({title: "Login Required", description: "Please log in to save your recipe."})} className="w-full sm:flex-grow">
                 <Save className="mr-2 h-4 w-4" /> Save Recipe
               </AccentButton>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
