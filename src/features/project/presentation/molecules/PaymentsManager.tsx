"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
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
        <Label>Payments</Label>
        <Button
          type="button"
          size="sm"
          onClick={handleAddPayment}
          disabled={disabled}
        >
          <Plus className="size-3.5 mr-1.5" />
          Add Payment
        </Button>
      </div>

      {paymentsList.length === 0 ? (
        <div className="rounded-md border border-border bg-muted p-3 text-center text-sm text-muted-foreground">
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
              <div className="w-24 text-right text-sm text-muted-foreground">
                {formatCurrency(payment)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePayment(index)}
                disabled={disabled}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                title="Remove payment"
              >
                <Trash className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {paymentsList.length > 0 && (
        <div className="flex items-center justify-between rounded-md border border-border bg-muted px-3 py-2">
          <span className="text-sm font-medium text-foreground">Total:</span>
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(
              paymentsList.reduce((sum, payment) => sum + (payment || 0), 0)
            )}
          </span>
        </div>
      )}
    </div>
  );
}

