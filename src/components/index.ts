// Re-export custom components (preferred - has compatibility wrappers)
export * from "./custom";

// Re-export only non-conflicting Shadcn UI components
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export { Skeleton } from "./ui/skeleton";
export { Alert, AlertTitle, AlertDescription } from "./ui/alert";
export { Separator } from "./ui/separator";
export { ScrollArea } from "./ui/scroll-area";
export { Toaster } from "./ui/sonner";
