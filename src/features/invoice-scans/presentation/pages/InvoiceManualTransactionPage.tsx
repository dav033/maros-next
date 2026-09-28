"use client";

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CircleDollarSign,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeaderCard } from "@/components/shared";
import { cn } from "@/lib/utils";

import type { InvoiceTransactionDirection } from "../../domain/models";
import { ProjectNumberSelect } from "../components/ProjectNumberSelect";
import { useCreateManualInvoiceTransaction } from "../hooks/useInvoiceScans";

function localToday(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function InvoiceManualTransactionPage() {
  const router = useRouter();
  const create = useCreateManualInvoiceTransaction();
  const [direction, setDirection] = useState<InvoiceTransactionDirection | "">(
    "",
  );
  const [projectNumber, setProjectNumber] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const counterpartyName = String(
      values.get("counterpartyName") ?? "",
    ).trim();
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
    router.push(`/finance/invoices/${transaction.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4">
      <PageHeaderCard
        icon={CircleDollarSign}
        title="Add a transaction"
        description="Record a payment without uploading a document. Choose whether money left or entered the business; it will be added to the QuickBooks entry queue."
        rightSlot={<Button asChild variant="outline"><Link href="/finance/invoices"><ArrowLeft className="mr-2 size-4" />Invoice scans</Link></Button>}
      />

      <form
        onSubmit={submit}
        className="space-y-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-6"
        aria-label="Add a manual transaction"
      >
        <fieldset className="space-y-3">
          <legend className="font-display text-base font-semibold">Payment direction</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-2xl border bg-elev-3 p-4 transition-colors hover:bg-elev-4",
                direction === "payment_made" && "border-primary/50 bg-primary/10 shadow-sm",
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
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-300"><ArrowUpRight className="size-5" aria-hidden="true" /></span>
              <span>
                <span className="block text-sm font-semibold">
                  Payment made
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Money out · paid to someone
                </span>
              </span>
            </label>
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-2xl border bg-elev-3 p-4 transition-colors hover:bg-elev-4",
                direction === "payment_received" &&
                  "border-primary/50 bg-primary/10 shadow-sm",
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
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300"><ArrowDownLeft className="size-5" aria-hidden="true" /></span>
              <span>
                <span className="block text-sm font-semibold">
                  Payment received
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Money in · received from someone
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <section className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">What was the payment for?</Label>
            <Input
              id="description"
              name="description"
              maxLength={255}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="counterpartyName">Paid to / received from</Label>
            <Input
              id="counterpartyName"
              name="counterpartyName"
              maxLength={255}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transactionDate">Date</Label>
            <Input
              id="transactionDate"
              name="transactionDate"
              type="date"
              defaultValue={localToday()}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              className="font-mono tabular-nums"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              name="currency"
              defaultValue="USD"
              minLength={3}
              maxLength={3}
              pattern="[A-Za-z]{3}"
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <p className="text-sm font-medium">Project (optional)</p>
            <ProjectNumberSelect
              value={projectNumber}
              onChange={setProjectNumber}
              disabled={create.isPending}
            />
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button asChild variant="outline">
            <Link href="/finance/invoices">Cancel</Link>
          </Button>
          <Button type="submit" disabled={create.isPending || !direction}>
            {create.isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : null}
            Add transaction
          </Button>
        </div>
      </form>
    </div>
  );
}
