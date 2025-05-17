
"use client";

import type { NutritionalInfo } from '@/types/recipe';
import type React from 'react';
import { cn } from "@/lib/utils";

interface NutritionalInfoDisplayProps {
  nutritionalInfo: NutritionalInfo;
  title: string;
  icon: React.ReactNode;
  titleClassName?: string;
  showDataBackground?: boolean; // New prop
}

export function NutritionalInfoDisplay({ nutritionalInfo: ni, title, icon, titleClassName, showDataBackground = true }: NutritionalInfoDisplayProps) {
  return (
    <div>
      <h3 className={cn(
        "text-xl font-semibold mb-3 flex items-center gap-2",
        titleClassName || "text-primary"
      )}>
        {icon} {title}
      </h3>
      <div className={cn(
        "grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-sm",
        showDataBackground ? "bg-muted/30 p-4 rounded-lg shadow" : "p-0" // Conditional background
        )}>
        <div><strong className="block text-muted-foreground">Calories:</strong> {ni.calories}</div>
        <div><strong className="block text-muted-foreground">Protein:</strong> {ni.protein}</div>
        <div><strong className="block text-muted-foreground">Carbs:</strong> {ni.carbohydrates}</div>
        <div><strong className="block text-muted-foreground">Fat:</strong> {ni.fat}</div>
      </div>
    </div>
  );
}
