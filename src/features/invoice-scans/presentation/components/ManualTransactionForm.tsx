"use client";

import { ArrowDownLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { InvoiceScan, InvoiceTransactionDirection } from "../../domain/models";
import { useCreateManualInvoiceTransaction } from "../hooks/useInvoiceScans";
import { ProjectNumberSelect } from "./ProjectNumberSelect";

function localToday(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

interface Props {
  /** Called with the saved record once the server accepts it. */
  onCreated: (transaction: InvoiceScan) => void;
  /** Whatever closes the form: a link on the page, a button in the dialog. */
  cancelSlot?: ReactNode;
  /** Identifies the form for assistive tech; two of these never share a page. */
  formLabel?: string;
  idPrefix?: string;
  className?: string;
}

/**
 * The manual-transaction fields on their own, so the standalone page and the
 * dialog on the list share one form instead of two that drift apart.
 */
export function ManualTransactionForm({
  onCreated,
  cancelSlot,
  formLabel = "Add a manual transaction",
  idPrefix = "manual-transaction",
  className,
}: Props) {
  const create = useCreateManualInvoiceTransaction();
  const [direction, setDirection] = useState<InvoiceTransactionDirection | "">("");
  const [projectNumber, setProjectNumber] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const counterpartyName = String(values.get("counterpartyName") ?? "").trim();
    const transaction = await create
      .mutateAsync({
        description: String(values.get("description") ?? "").trim(),
        direction: direction as InvoiceTransactionDirection,
        transactionDate: String(values.get("transactionDate") ?? ""),
        amount: Number(values.get("amount")),
        currency: String(values.get("currency") ?? "USD")
          .trim()
          .toUpperCase(),
        ...(counterpartyName && { counterpartyName }),
        projectNumber,
      })
      .catch(() => null);
    if (!transaction) return;
    onCreated(transaction);
  }

  const field = (name: string) => `${idPrefix}-${name}`;

  return (
    <form onSubmit={submit} className={cn("space-y-4", className)} aria-label={formLabel}>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Payment direction</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-elev-3 p-2.5 transition-colors hover:bg-elev-4",
              direction === "payment_made" && "border-primary/50 bg-primary/10",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
            )}
          >
            <input
              className="peer sr-only"
              type="radio"
              name="direction"
              value="payment_made"
              checked={direction === "payment_made"}
              onChange={() => setDirection("payment_made")}
              required
            />
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight">Payment made</span>
              <span className="mt-0.5 block text-xs leading-tight text-muted-foreground">
                Money out · paid to someone
              </span>
            </span>
          </label>
          <label
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-elev-3 p-2.5 transition-colors hover:bg-elev-4",
              direction === "payment_received" && "border-primary/50 bg-primary/10",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
            )}
          >
            <input
              className="peer sr-only"
              type="radio"
              name="direction"
              value="payment_received"
              checked={direction === "payment_received"}
              onChange={() => setDirection("payment_received")}
              required
            />
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary-on-container">
              <ArrowDownLeft className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight">Payment received</span>
              <span className="mt-0.5 block text-xs leading-tight text-muted-foreground">
                Money in · received from someone
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <section className="grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={field("description")}>What was the payment for?</Label>
          <Input
            id={field("description")}
            name="description"
            maxLength={255}
            className="h-9 border-line-strong"
            required
            autoFocus
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={field("counterpartyName")}>Paid to / received from</Label>
          <Input
            id={field("counterpartyName")}
            name="counterpartyName"
            maxLength={255}
            className="h-9 border-line-strong"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={field("transactionDate")}>Date</Label>
          <Input
            id={field("transactionDate")}
            name="transactionDate"
            type="date"
            defaultValue={localToday()}
            className="h-9 border-line-strong"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={field("amount")}>Amount</Label>
          <Input
            id={field("amount")}
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            className="h-9 border-line-strong font-mono tabular-nums"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={field("currency")}>Currency</Label>
          <Input
            id={field("currency")}
            name="currency"
            defaultValue="USD"
            minLength={3}
            maxLength={3}
            pattern="[A-Za-z]{3}"
            className="h-9 border-line-strong"
            required
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <p className="text-sm font-medium">Project (optional)</p>
          <ProjectNumberSelect
            value={projectNumber}
            onChange={setProjectNumber}
            disabled={create.isPending}
          />
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-3">
        {cancelSlot}
        <Button type="submit" size="sm" disabled={create.isPending || !direction}>
          {create.isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : null}
          Add transaction
        </Button>
      </div>
    </form>
  );
}
