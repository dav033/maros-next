import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      // `skeleton-sheen` (globals.css) is the app's single loading animation: one
      // direction, one 1.6s cycle, everywhere. It also paints the body colour.
      //
      // That body is --line, not an elevation step: a skeleton lands on any of
      // them (elev-1 panel, elev-2 card, elev-3 sidebar, elev-4 menu, elev-5
      // dialog), so borrowing one would make it invisible on its own step
      // (1.00:1). --line sits above the whole scale and keeps >= 1.3:1 on all
      // five (1.73 / 1.63 / 1.54 / 1.43 / 1.32).
      className={cn("skeleton-sheen rounded-md", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
