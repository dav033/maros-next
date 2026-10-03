"use client";

import { useState } from "react";
import { LeadStatus, type LeadLostReason } from "@/leads/domain";

export interface LeadStatusChangeRequest {
  status: LeadStatus;
  /**
   * Cuántos leads reciben este cambio. El diálogo lo dice en voz alta: un motivo
   * elegido para un lote se aplica tal cual a todos, y eso no puede ser una sorpresa.
   */
  appliesToCount?: number;
  initialReason?: LeadLostReason | null;
  commit: (lostReason?: LeadLostReason) => void | Promise<void>;
}

type PendingLostChange = Required<Pick<LeadStatusChangeRequest, "appliesToCount">> & {
  initialReason: LeadLostReason | null;
  commit: (lostReason: LeadLostReason) => void | Promise<void>;
};

/**
 * Pasar a LOST sin motivo lo rechaza el backend con 422
 * (LEAD_LOST_REASON_REQUIRED). Este es el mismo trato que la ficha del lead da al
 * select de estado, empaquetado para los sitios que cambian el estado desde una
 * tabla: LOST abre el diálogo y sólo se envía cuando hay motivo, cualquier otro
 * estado se envía en el acto, y cancelar no envía nada.
 */
export function useLeadStatusChange() {
  const [pending, setPending] = useState<PendingLostChange | null>(null);

  const requestStatusChange = async ({
    status,
    appliesToCount = 1,
    initialReason = null,
    commit,
  }: LeadStatusChangeRequest): Promise<void> => {
    if (status !== LeadStatus.LOST) {
      await commit();
      return;
    }
    setPending({ appliesToCount, initialReason, commit });
  };

  return {
    requestStatusChange,
    lostReasonDialogProps: {
      open: pending !== null,
      appliesToCount: pending?.appliesToCount ?? 1,
      initialReason: pending?.initialReason ?? null,
      onCancel: () => setPending(null),
      onConfirm: (reason: LeadLostReason) => {
        void pending?.commit(reason);
        setPending(null);
      },
    },
  };
}

export type UseLeadStatusChangeReturn = ReturnType<typeof useLeadStatusChange>;
