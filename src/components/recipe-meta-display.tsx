
"use client";

import { Timer, Flame, Users } from 'lucide-react';

interface RecipeMetaDisplayProps {
  prepTime?: string;
  cookTime?: string;
  servings?: string;
}

export function RecipeMetaDisplay({ prepTime, cookTime, servings }: RecipeMetaDisplayProps) {
  const items = [];
  if (prepTime) {
    items.push({
      label: "PREP TIME",
      value: prepTime,
      icon: <Timer className="h-7 w-7 text-blue-500 mb-1.5" />,
      key: "prep"
    });
  }
  if (cookTime) {
    items.push({
      label: "COOK TIME",
      value: cookTime,
      icon: <Flame className="h-7 w-7 text-red-500 mb-1.5" />,
      key: "cook"
    });
  }
  if (servings) {
    items.push({
      label: "SERVINGS",
      value: servings,
      icon: <Users className="h-7 w-7 text-accent mb-1.5" />,
      key: "servings"
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 py-4">
      {items.map((item) => (
        <div key={item.key} className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg shadow-sm aspect-square text-center">
          {item.icon}
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</h3>
          <p className="text-md font-medium text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

