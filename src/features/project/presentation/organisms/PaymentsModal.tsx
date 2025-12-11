"use client";

import { Modal, BasicModalFooter, Input, Icon } from "@dav033/dav-components";
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
    <Modal
      isOpen={isOpen}
      title={`Manage Payments - ${selectedProject.lead.name}`}
      onClose={close}
      footer={
        <BasicModalFooter
          onCancel={close}
          onSubmit={save}
          isLoading={isLoading}
          canSubmit={!isLoading}
          mode="update"
        />
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Payments</label>
          <button
            type="button"
            onClick={addPayment}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-theme-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-theme-primary/20 transition-all hover:bg-theme-primary/90 hover:shadow-xl hover:shadow-theme-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            <Icon name="mdi:plus" size={18} />
            Add Payment
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-xl border border-gray-700/50 bg-[#1a1a1d] p-6 text-center shadow-inner">
            <Icon name="mdi:wallet-outline" size={32} className="mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-400">No payments added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 rounded-xl border border-gray-700/50 bg-[#1f1f23] p-3 shadow-md transition-all hover:border-gray-600/50 hover:bg-[#252529] hover:shadow-lg"
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
                <div className="w-36 rounded-lg bg-[#2a2a2d] px-4 py-2 text-right">
                  <span className="text-sm font-semibold text-gray-200">
                    {formatCurrency(payment)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removePayment(index)}
                  disabled={isLoading}
                  className="flex items-center justify-center rounded-lg p-2.5 text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  title="Remove payment"
                >
                  <Icon name="mdi:delete-outline" size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {payments.length > 0 && (
          <div className="rounded-xl border border-gray-700/50 bg-gradient-to-r from-[#1f1f23] to-[#252529] px-5 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
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
              <Icon name="mdi:alert-circle" size={16} className="text-red-400" />
            </div>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

