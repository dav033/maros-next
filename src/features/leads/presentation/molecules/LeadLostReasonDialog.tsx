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
import { LEAD_LOST_REASONS, type LeadLostReason } from "@/leads/domain";
import { LEAD_LOST_REASON_LABELS } from "../atoms/leadVisualTokens";

/**
 * Pasar a LOST sin motivo lo rechaza el backend con 422
 * (LEAD_LOST_REASON_REQUIRED), así que el motivo se pide dentro del mismo gesto:
 * el estado sólo se mueve a LOST cuando hay motivo, y cancelar deja el lead como
 * estaba en vez de empujar al usuario contra un error del servidor.
 */
export function LeadLostReasonDialog({
  open,
  initialReason,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  initialReason?: LeadLostReason | null;
  onCancel: () => void;
  onConfirm: (reason: LeadLostReason) => void;
}) {
  const [reason, setReason] = useState<LeadLostReason | null>(initialReason ?? null);

  useEffect(() => {
    if (open) setReason(initialReason ?? null);
  }, [open, initialReason]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Why was this lead lost?</DialogTitle>
          <DialogDescription>
            The lost pipeline is only worth reading if every loss says why.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {LEAD_LOST_REASONS.map((value) => (
            <Button
              key={value}
              type="button"
              variant={reason === value ? "default" : "outline"}
              aria-pressed={reason === value}
              className="justify-start"
              onClick={() => setReason(value)}
            >
              {LEAD_LOST_REASON_LABELS[value]}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={reason === null}
            onClick={() => reason && onConfirm(reason)}
          >
            Mark as lost
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
