"use client";

import { Input, Icon } from "@dav033/dav-components";
import { formatCurrency } from "@/shared/utils";

type PaymentsManagerProps = {
  payments: number[];
  onChange: (payments: number[]) => void;
  disabled?: boolean;
};

export function PaymentsManager({
  payments,
  onChange,
  disabled = false,
}: PaymentsManagerProps) {
  const handleAddPayment = () => {
    onChange([...(payments || []), 0]);
  };

  const handleRemovePayment = (index: number) => {
    if (payments && payments.length > 0) {
      const newPayments = payments.filter((_, i) => i !== index);
      onChange(newPayments.length > 0 ? newPayments : []);
    }
  };

  const handlePaymentChange = (index: number, value: string) => {
    if (!payments) return;
    const numValue = value === "" ? 0 : Number(value);
    const newPayments = [...payments];
    newPayments[index] = numValue;
    onChange(newPayments);
  };

  const paymentsList = payments && payments.length > 0 ? payments : [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Payments</label>
        <button
          type="button"
          onClick={handleAddPayment}
          disabled={disabled}
          className="flex items-center gap-1 rounded-md bg-theme-primary px-2 py-1 text-xs text-white transition-colors hover:bg-theme-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="mdi:plus" size={14} />
          Add Payment
        </button>
      </div>

      {paymentsList.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center text-sm text-gray-500">
          No payments added yet
        </div>
      ) : (
        <div className="space-y-2">
          {paymentsList.map((payment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.01"
                  value={payment || ""}
                  onChange={(e) => handlePaymentChange(index, e.target.value)}
                  placeholder="Payment amount"
                  disabled={disabled}
                />
              </div>
              <div className="w-24 text-right text-sm text-gray-600">
                {formatCurrency(payment)}
              </div>
              <button
                type="button"
                onClick={() => handleRemovePayment(index)}
                disabled={disabled}
                className="flex items-center justify-center rounded-md p-2 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove payment"
              >
                <Icon name="mdi:delete" size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {paymentsList.length > 0 && (
        <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <span className="text-sm font-medium text-gray-700">Total:</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(
              paymentsList.reduce((sum, payment) => sum + (payment || 0), 0)
            )}
          </span>
        </div>
      )}
    </div>
  );
}

