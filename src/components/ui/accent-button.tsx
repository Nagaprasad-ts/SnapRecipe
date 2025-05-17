
"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AccentButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <Button
      ref={ref}
      {...props}
      className={cn(
        "bg-accent text-accent-foreground hover:bg-accent/90",
        className
      )}
    >
      {children}
    </Button>
  )
);
AccentButton.displayName = "AccentButton";
