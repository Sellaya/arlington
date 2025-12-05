import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transform-gpu shadow-3d-sm hover:shadow-3d-md hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-glow-primary/50 hover:shadow-glow-primary",
        secondary:
          "border-transparent bg-gradient-to-br from-secondary to-secondary/90 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/80",
        destructive:
          "border-transparent bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/80",
        outline: "text-foreground border-2 border-border/60 bg-background/80 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
