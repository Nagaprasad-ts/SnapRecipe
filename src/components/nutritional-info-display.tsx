
"use client";

import type { NutritionalInfo } from '@/types/recipe';
import type React from 'react';
import { cn } from "@/lib/utils";

interface NutritionalInfoDisplayProps {
  nutritionalInfo: NutritionalInfo;
  title: string;
  icon: React.ReactNode;
  titleClassName?: string; 
}

export function NutritionalInfoDisplay({ nutritionalInfo: ni, title, icon, titleClassName }: NutritionalInfoDisplayProps) {
  return (
    <div>
      <h3 className={cn(
        "text-xl font-semibold mb-3 flex items-center gap-2",
        titleClassName || "text-primary" // Default to primary if no custom class
      )}>
        {icon} {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 bg-muted/30 p-4 rounded-lg text-sm shadow">
        <div><strong className="block text-muted-foreground">Calories:</strong> {ni.calories}</div>
        <div><strong className="block text-muted-foreground">Protein:</strong> {ni.protein}</div>
        <div><strong className="block text-muted-foreground">Carbs:</strong> {ni.carbohydrates}</div>
        <div><strong className="block text-muted-foreground">Fat:</strong> {ni.fat}</div>
      </div>
    </div>
  );
}
