"use client";

import { Plus, Wallet, Trash, AlertCircle, Save, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { formatCurrency } from "@/shared/utils";
import type { UsePaymentsModalResult } from "../hooks/modals/usePaymentsModal";

interface PaymentsModalProps {
  controller: UsePaymentsModalResult;
}

export function PaymentsModal({ controller }: PaymentsModalProps) {
  const {
    isOpen,
    selectedProject,
    payments,
    close,
    updatePayment,
    addPayment,
    removePayment,
    save,
    isLoading,
    error,
  } = controller;

  if (!selectedProject) return null;

  const total = payments.reduce((sum, payment) => sum + (payment || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Payments - {selectedProject.lead.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Payments</label>
          <Button
            type="button"
            onClick={addPayment}
            disabled={isLoading}
          >
            <Plus className="size-4 mr-2" />
            Add Payment
          </Button>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted p-6 text-center shadow-inner">
            <Wallet className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No payments added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-md transition-all hover:border-border hover:bg-accent hover:shadow-lg"
              >
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={payment || ""}
                    onChange={(e) =>
                      updatePayment(index, e.target.value === "" ? 0 : Number(e.target.value))
                    }
                    placeholder="Payment amount"
                    disabled={isLoading}
                  />
                </div>
                <div className="w-36 rounded-lg bg-muted px-4 py-2 text-right">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(payment)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePayment(index)}
                  disabled={isLoading}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  title="Remove payment"
                >
                  <Trash className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {payments.length > 0 && (
          <div className="rounded-xl border border-border bg-gradient-to-r from-card to-accent px-5 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Total:
              </span>
              <span className="text-2xl font-bold text-white">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <AlertCircle className="size-4 text-red-400" />
            </div>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={save}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

