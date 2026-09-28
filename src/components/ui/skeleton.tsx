import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      // A skeleton lands on any elevation step (elev-1 panel, elev-2 card,
      // elev-3 sidebar, elev-4 menu, elev-5 dialog), so it cannot borrow one of
      // them: on its own step it would be invisible (1.00:1). --line sits above
      // the whole scale and keeps >= 1.3:1 on all five
      // (1.73 / 1.63 / 1.54 / 1.43 / 1.32).
      className={cn("animate-pulse rounded-md bg-line", className)}
      {...props}
    />
  )
}

export { Skeleton }
