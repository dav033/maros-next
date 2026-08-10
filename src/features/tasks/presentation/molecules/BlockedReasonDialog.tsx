"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Gates every move into `blocked`: the backend rejects the transition with no reason
 * (see TaskBlockedReasonRequiredException), so this collects one before the move call
 * ever goes out — same UX either way, whether the task carried an old reason or not.
 */
export function BlockedReasonDialog({
  open,
  initialReason,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  initialReason?: string | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState(initialReason ?? "");

  useEffect(() => {
    if (open) setReason(initialReason ?? "");
  }, [open, initialReason]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Why is this task blocked?</DialogTitle>
          <DialogDescription>
            Waiting on material, an inspection, a signature, weather — whatever it is,
            the board shows it right on the card.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Waiting on permit approval from the county…"
          rows={3}
          autoFocus
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={reason.trim().length === 0}
            onClick={() => onConfirm(reason.trim())}
          >
            Mark blocked
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
