import { useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, Clock3, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus } from "@/tasks/domain";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { DueDatePill } from "../atoms/DueDatePill";
import { JobAddressLink } from "../molecules/JobAddressLink";

/** backlog/todo → Start, in_progress → Mark done. `findMine` never returns done/cancelled/blocked-without-a-next-step. */
function nextAction(status: TaskStatus): { status: "in_progress" | "done"; label: string; icon: typeof Play } | null {
  if (status === "backlog" || status === "todo") return { status: "in_progress", label: "Start", icon: Play };
  if (status === "in_progress") return { status: "done", label: "Mark done", icon: CheckCircle2 };
  return null;
}

/**
 * One row in "Mine" — the mobile-first view a crew member opens on a job site. Per
 * PLAN-TAREAS.md §6.3: derived address with a map link, a one-tap status button, and a
 * shortcut into the photo upload already built into TaskDetailSheet (EntityAttachmentsSection),
 * rather than a second upload implementation living here.
 */
export function MyTaskRow({
  task,
  onOpen,
  onAdvance,
  isAdvancing,
  onPhotoSelected,
  onTimer,
  isTiming,
  onPostpone,
}: {
  task: Task;
  onOpen: () => void;
  onAdvance: (status: "in_progress" | "done") => void;
  isAdvancing: boolean;
  onPhotoSelected?: (file: File) => Promise<void>;
  onTimer?: (action: "start" | "stop") => void;
  isTiming?: boolean;
  onPostpone?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Resolved server-side, not derived here — see TaskEntityRef.
  const address = task.entity?.address
    ? { label: task.entity.address, href: task.entity.addressLink ?? null }
    : null;
  const action = nextAction(task.status);

  return (
    <div
      className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm"
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStartX.current == null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < 72) return;
        if (delta > 0 && action) onAdvance(action.status);
        if (delta < 0 && onPostpone) onPostpone();
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-col gap-1 text-left">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <TaskKindIcon kind={task.kind} />
            T-{task.id}
          </span>
          <span className="text-sm font-medium leading-snug text-foreground">{task.title}</span>
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Add a photo"
          title="Add a photo"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file || !onPhotoSelected) return;
            setIsUploading(true);
            try {
              await onPhotoSelected(file);
            } finally {
              setIsUploading(false);
            }
          }}
        />
      </div>

      {task.status === "blocked" && task.blockedReason ? (
        <div className="flex items-start gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{task.blockedReason}</span>
        </div>
      ) : null}

      {address || task.dueDate ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <JobAddressLink address={address} />
          {task.dueDate ? <DueDatePill dueDate={task.dueDate} /> : null}
        </div>
      ) : null}

      {onTimer ? (
        <Button
          type="button"
          size="sm"
          variant={task.startedAt ? "default" : "outline"}
          className="h-9 w-fit gap-1.5"
          disabled={isTiming}
          onClick={() => onTimer(task.startedAt ? "stop" : "start")}
        >
          {isTiming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock3 className="h-3.5 w-3.5" />}
          {task.startedAt ? "Stop timer" : "Start timer"}
        </Button>
      ) : null}

      {action ? (
        <Button
          type="button"
          size="lg"
          className="h-12 w-full gap-2"
          disabled={isAdvancing}
          onClick={() => onAdvance(action.status)}
        >
          <action.icon className="h-4 w-4" />
          {isAdvancing ? "Updating…" : action.label}
        </Button>
      ) : null}
    </div>
  );
}
