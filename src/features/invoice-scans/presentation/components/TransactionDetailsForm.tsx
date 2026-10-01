"use client";

import { ArrowDownLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TRANSACTION_DIRECTION_LABELS } from "../../domain/labels";
import type {
  ExtractedInvoiceData,
  InvoiceScanPatch,
  InvoiceTransactionDirection,
} from "../../domain/models";

interface Props {
  data: ExtractedInvoiceData | null;
  onSave: (patch: InvoiceScanPatch) => Promise<unknown>;
  saving: boolean;
  disabled?: boolean;
}

interface Values {
  description: string;
  transactionDirection: InvoiceTransactionDirection;
  counterpartyName: string;
  issueDate: string;
  amount: string;
  currency: string;
}

function toValues(data: ExtractedInvoiceData | null): Values {
  return {
    description: data?.description ?? "",
    transactionDirection: data?.transactionDirection ?? "payment_made",
    counterpartyName: data?.counterpartyName ?? "",
    issueDate: data?.issueDate ?? "",
    amount: data?.total === null || data?.total === undefined ? "" : String(data.total),
    currency: data?.currency ?? "USD",
  };
}

/**
 * Los campos de una transacción manual, editables. La ficha era de solo lectura:
 * si el monto quedaba mal (porque se escribió mal o porque el escaneo leyó otro
 * número) no había forma de corregirlo sin borrar y volver a crearla.
 */
export function TransactionDetailsForm({ data, onSave, saving, disabled }: Props) {
  const [values, setValues] = useState<Values>(() => toValues(data));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(toValues(data));
    setError(null);
  }, [data]);

  const stored = toValues(data);
  const dirty = (Object.keys(stored) as Array<keyof Values>).some(
    (key) => stored[key] !== values[key],
  );
  const locked = disabled || saving;

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = values.amount.trim() === "" ? null : Number(values.amount);
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
      setError("Enter a valid amount (0 or greater).");
      return;
    }
    if (values.description.trim() === "") {
      setError("Say what the payment was for.");
      return;
    }
    setError(null);
    await onSave({
      description: values.description.trim(),
      transactionDirection: values.transactionDirection,
      counterpartyName: values.counterpartyName.trim() || null,
      issueDate: values.issueDate || null,
      // Un pago manual es un solo importe: el subtotal acompaña al total para que
      // las dos cifras no se contradigan.
      total: amount,
      subtotal: amount,
      currency: values.currency.trim().toUpperCase() || null,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="Transaction details">
      <div className="flex items-start gap-3">
        {values.transactionDirection === "payment_received" ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
            <ArrowDownLeft className="size-5" aria-hidden="true" />
          </span>
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </span>
        )}
        <div>
          <h2 className="font-display font-semibold">Manual transaction</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Correct any value and save; the amount here is the one that counts.
          </p>
        </div>
      </div>

      <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="transaction-description" className="text-xs font-medium text-muted-foreground">
            What was the payment for?
          </Label>
          <Input
            id="transaction-description"
            value={values.description}
            maxLength={255}
            disabled={locked}
            onChange={(event) => set("description", event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="transaction-direction" className="text-xs font-medium text-muted-foreground">
            Direction
          </Label>
          <Select
            value={values.transactionDirection}
            disabled={locked}
            onValueChange={(next) => set("transactionDirection", next as InvoiceTransactionDirection)}
          >
            <SelectTrigger id="transaction-direction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.keys(TRANSACTION_DIRECTION_LABELS) as InvoiceTransactionDirection[]
              ).map((key) => (
                <SelectItem key={key} value={key}>
                  {TRANSACTION_DIRECTION_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="transaction-counterparty" className="text-xs font-medium text-muted-foreground">
            {values.transactionDirection === "payment_received" ? "Received from" : "Paid to"}
          </Label>
          <Input
            id="transaction-counterparty"
            value={values.counterpartyName}
            maxLength={255}
            disabled={locked}
            onChange={(event) => set("counterpartyName", event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="transaction-date" className="text-xs font-medium text-muted-foreground">
            Date
          </Label>
          <Input
            id="transaction-date"
            type="date"
            value={values.issueDate}
            disabled={locked}
            onChange={(event) => set("issueDate", event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="transaction-amount" className="text-xs font-medium text-muted-foreground">
            Amount
          </Label>
          <Input
            id="transaction-amount"
            inputMode="decimal"
            value={values.amount}
            disabled={locked}
            className="font-mono font-semibold tabular-nums"
            onChange={(event) => set("amount", event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="transaction-currency" className="text-xs font-medium text-muted-foreground">
            Currency
          </Label>
          <Input
            id="transaction-currency"
            value={values.currency}
            maxLength={3}
            disabled={locked}
            className="uppercase"
            onChange={(event) => set("currency", event.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {(dirty || saving) && (
        <div
          className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-elev-4 px-4 py-3 shadow-lg"
          role="region"
          aria-label="Unsaved changes"
        >
          <span className="text-sm text-muted-foreground">You have unsaved changes.</span>
          <span className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={() => {
                setValues(toValues(data));
                setError(null);
              }}
            >
              Discard
            </Button>
            <Button type="submit" size="sm" disabled={locked}>
              {saving && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              Save changes
            </Button>
          </span>
        </div>
      )}
    </form>
  );
}
