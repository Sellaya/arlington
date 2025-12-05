import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-3d transform-gpu will-change-transform",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-3d-md hover:shadow-3d-lg hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.97] active:shadow-3d-sm border border-primary/20",
        destructive:
          "bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground shadow-3d-md hover:shadow-3d-lg hover:scale-[1.02] active:scale-[0.97] active:shadow-3d-sm border border-destructive/20",
        outline:
          "border-2 border-input/60 bg-background/90 backdrop-blur-sm shadow-3d-sm hover:bg-muted/80 hover:border-primary/40 hover:shadow-3d-md hover:scale-[1.02] active:scale-[0.98] active:shadow-3d-sm",
        secondary:
          "bg-gradient-to-br from-secondary to-secondary/90 text-secondary-foreground shadow-3d-sm hover:shadow-3d-md hover:scale-[1.02] active:scale-[0.97] active:shadow-3d-sm border border-secondary/20",
        ghost:
          "bg-transparent hover:bg-muted/80 text-foreground/80 hover:text-foreground hover:shadow-3d-sm hover:scale-[1.02] active:scale-[0.98] transition-all",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:scale-[0.98]",
        subtle:
          "bg-muted/60 backdrop-blur-sm text-foreground/80 hover:bg-muted/80 hover:text-foreground border border-border/60 shadow-3d-sm hover:shadow-3d-md hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-12 px-5 min-h-[48px] text-base", // Touch-friendly 48px minimum
        sm: "h-10 px-4 text-sm min-h-[40px]",
        lg: "h-14 px-8 text-lg min-h-[56px]",
        icon: "h-12 w-12 min-h-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
