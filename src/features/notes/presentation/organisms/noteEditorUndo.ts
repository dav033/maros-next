import { toast } from "sonner";

/** Keep destructive editor actions immediate while making the undo path obvious. */
export function notifyEditorUndo(label = "Deleted") {
  const shortcut =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
      ? "⌘Z"
      : "Ctrl+Z";

  toast.success(label, {
    description: `Press ${shortcut} to undo.`,
  });
}
