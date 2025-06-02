"use client";

import { Timer, Flame, Users } from "lucide-react";

interface RecipeMetaDisplayProps {
  prepTime?: string;
  cookTime?: string;
  servings?: string;
}

export function RecipeMetaDisplay({
  prepTime,
  cookTime,
  servings,
}: RecipeMetaDisplayProps) {
  const items = [];
  if (prepTime) {
    items.push({
      label: "PREP TIME",
      value: prepTime,
      icon: <Timer className="h-7 w-7 text-blue-500" />,
      key: "prep",
    });
  }
  if (cookTime) {
    items.push({
      label: "COOK TIME",
      value: cookTime,
      icon: <Flame className="h-7 w-7 text-red-500" />,
      key: "cook",
    });
  }
  if (servings) {
    items.push({
      label: "SERVINGS",
      value: servings,
      icon: <Users className="h-7 w-7 text-accent" />,
      key: "servings",
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 py-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex flex-row md:flex-col items-center justify-around md:justify-normal text-center p-4 bg-muted/50 rounded-lg shadow-sm gap-x-5 md:gap-x-0 md:gap-y-2 hover:bg-muted transition-colors duration-200"
          data-ai-hint={`recipe meta display ${item.label.toLowerCase()}`}
        >
          <div className="text-2xl mb-1 flex flex-row md:flex-col items-center justify-center gap-2 md:gap-y-1">{item.icon}
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider md:mb-0.5">
              {item.label}
            </h3>
          </div>
          <p className="text-md font-medium text-foreground leading-tight">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
