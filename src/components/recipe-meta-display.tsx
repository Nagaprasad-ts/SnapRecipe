
"use client";

import { Timer, Flame, Users } from 'lucide-react';

interface RecipeMetaDisplayProps {
  prepTime?: string;
  cookTime?: string;
  servings?: string;
}

export function RecipeMetaDisplay({ prepTime, cookTime, servings }: RecipeMetaDisplayProps) {
  if (!prepTime && !cookTime && !servings) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 py-4">
      {prepTime && (
        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg shadow">
          <Timer className="h-7 w-7 text-blue-500 mb-1.5" /> {/* Blue icon */}
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Prep Time</h3>
          <p className="text-lg font-medium text-foreground">{prepTime}</p>
        </div>
      )}
      {cookTime && (
        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg shadow">
          <Flame className="h-7 w-7 text-red-500 mb-1.5" /> {/* Red icon */}
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Cook Time</h3>
          <p className="text-lg font-medium text-foreground">{cookTime}</p>
        </div>
      )}
      {servings && (
        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg shadow">
          <Users className="h-7 w-7 text-accent mb-1.5" /> {/* Orange (accent) icon */}
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Servings</h3>
          <p className="text-lg font-medium text-foreground">{servings}</p>
        </div>
      )}
    </div>
  );
}
