"use client";

import { ArrowLeft, CircleDollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeaderCard } from "@/components/shared";
import { Button } from "@/components/ui/button";

import { ManualTransactionForm } from "../components/ManualTransactionForm";

/**
 * The standalone page for the same form the list opens in a dialog; kept so a
 * saved link to /finance/invoices/transaction still works.
 */
export function InvoiceManualTransactionPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3">
      <PageHeaderCard
        icon={CircleDollarSign}
        title="Add a transaction"
        description="Record a payment without uploading a document. Choose whether money left or entered the business; it will be added to the QuickBooks entry queue."
        rightSlot={
          <Button asChild size="sm" variant="outline">
            <Link href="/finance/invoices">
              <ArrowLeft className="mr-2 size-4" />
              Document scans
            </Link>
          </Button>
        }
      />

      <ManualTransactionForm
        className="rounded-xl border border-line bg-elev-1 p-4 shadow-sm sm:p-5"
        idPrefix="manual-transaction-page"
        onCreated={(transaction) => router.push(`/finance/invoices/${transaction.id}`)}
        cancelSlot={
          <Button asChild size="sm" variant="outline">
            <Link href="/finance/invoices">Cancel</Link>
          </Button>
        }
      />
    </div>
  );
}
