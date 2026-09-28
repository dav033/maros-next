"use client";

import { useState } from "react";
import { Unlink } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useUnlinkProjectQboLink } from "../hooks/useUnlinkProjectQboLink";

interface QuickbooksUnlinkProjectButtonProps {
  projectId: number;
  /** Job de QuickBooks vinculado hoy: se muestra en la confirmación. */
  qboCustomerId: string;
  /** Se llama tras romper el vínculo, para refrescar lo que dependa del proyecto. */
  onUnlinked?: () => void;
  disabled?: boolean;
}

export function QuickbooksUnlinkProjectButton({
  projectId,
  qboCustomerId,
  onUnlinked,
  disabled,
}: QuickbooksUnlinkProjectButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const unlinkMutation = useUnlinkProjectQboLink();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsConfirming(true)}
        disabled={disabled || unlinkMutation.isPending}
      >
        <Unlink className="size-4 mr-2" />
        {unlinkMutation.isPending ? "Desvinculando..." : "Desvincular de QuickBooks"}
      </Button>

      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desvincular este proyecto de QuickBooks?</AlertDialogTitle>
            <AlertDialogDescription>
              Se rompe el vínculo con el job de QuickBooks{" "}
              <span className="font-mono text-foreground">{qboCustomerId}</span>. No se borra
              el proyecto ni el lead, y en QuickBooks no cambia nada. Lo que sí desaparece de
              esta ficha son las cifras que vienen de QuickBooks —facturas, pagos, gastos y
              adjuntos— hasta que el proyecto se vuelva a vincular desde «Import from
              QuickBooks».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                unlinkMutation.mutate(projectId, {
                  onSuccess: (result) => {
                    toast.success(
                      result.unlinked
                        ? "Proyecto desvinculado de QuickBooks."
                        : "Este proyecto ya no tenía vínculo con QuickBooks.",
                    );
                    onUnlinked?.();
                  },
                  onError: (error) => {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "No se pudo desvincular el proyecto",
                    );
                  },
                });
                setIsConfirming(false);
              }}
            >
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
