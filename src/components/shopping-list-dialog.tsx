
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ClipboardList, X as LucideX } from "lucide-react"; // Renamed X to LucideX to avoid conflict
import { ScrollArea } from "./ui/scroll-area";

interface ShoppingListDialogProps {
  recipeName: string;
  ingredients: string[];
  children: React.ReactNode; // To wrap the trigger button
}

export function ShoppingListDialog({ recipeName, ingredients, children }: ShoppingListDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-primary">
            <ClipboardList className="h-6 w-6" /> Shopping List
          </DialogTitle>
          <DialogDescription>
            Ingredients for your recipe: <strong>{recipeName}</strong>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3 py-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-muted/20 rounded-md">
                <Checkbox id={`ingredient-${recipeName.replace(/\s+/g, '-')}-${index}`} />
                <Label
                  htmlFor={`ingredient-${recipeName.replace(/\s+/g, '-')}-${index}`}
                  className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                >
                  {ingredient}
                </Label>
              </div>
            ))}
            {ingredients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No ingredients listed for this recipe.</p>
            )}
          </div>
        </ScrollArea>
         <DialogClose asChild>
            <Button variant="outline" className="mt-4 w-full">
              <LucideX className="mr-2 h-4 w-4" /> Close
            </Button>
          </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
