import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/80 to-muted shadow-3d-sm",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
