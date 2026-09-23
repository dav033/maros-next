"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

import {
  invoiceScanFormDefaults,
  invoiceScanFormSchema,
  invoiceScanFormToPatch,
  type InvoiceScanFormValues,
} from "../../domain/invoiceScanForm";
import {
  CLASSIFICATION_LABELS,
  DIRECTION_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../../domain/labels";
import type { ExtractedInvoiceData, InvoiceScanPatch } from "../../domain/models";

interface Props {
  data: ExtractedInvoiceData | null;
  onSave: (patch: InvoiceScanPatch) => Promise<unknown>;
  saving: boolean;
  disabled?: boolean;
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Every extracted field, always editable. The Save bar only appears once
 * something changed, so a reviewer who agrees with the scan just ticks
 * "Entered" and moves on.
 */
export function InvoiceDetailsForm({ data, onSave, saving, disabled }: Props) {
  const form = useForm<InvoiceScanFormValues>({
    resolver: zodResolver(invoiceScanFormSchema),
    defaultValues: invoiceScanFormDefaults(data),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const lines = useFieldArray({ control, name: "lineItems" });

  useEffect(() => {
    reset(invoiceScanFormDefaults(data));
  }, [data, reset]);

  const errors = formState.errors;
  const dirty = formState.isDirty;
  const locked = disabled || saving;

  const submit = handleSubmit(async (values) => {
    await onSave(invoiceScanFormToPatch(values));
  });

  return (
    <form onSubmit={submit} className="space-y-5" aria-label="Invoice details">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Invoice details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {data
              ? "Read from the document. Fix anything that does not match the original."
              : "The scan did not produce details. Type them from the document to continue."}
          </p>
        </div>
        {data && data.confidence > 0 && (
          <Badge variant="outline" className="font-medium text-muted-foreground">
            Scan confidence {Math.round(data.confidence * 100)}%
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company / customer" htmlFor="counterpartyName" error={errors.counterpartyName?.message}>
          <Input id="counterpartyName" {...register("counterpartyName")} disabled={locked} placeholder="Who issued or receives it" />
        </Field>
        <Field label="Invoice number" htmlFor="invoiceNumber" error={errors.invoiceNumber?.message}>
          <Input id="invoiceNumber" {...register("invoiceNumber")} disabled={locked} />
        </Field>
        <Field label="Document type" htmlFor="direction">
          <Controller
            control={control}
            name="direction"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={locked}>
                <SelectTrigger id="direction"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(DIRECTION_LABELS) as Array<keyof typeof DIRECTION_LABELS>).map((key) => (
                    <SelectItem key={key} value={key}>{DIRECTION_LABELS[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Category" htmlFor="classification">
          <Controller
            control={control}
            name="classification"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={locked}>
                <SelectTrigger id="classification"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CLASSIFICATION_LABELS) as Array<keyof typeof CLASSIFICATION_LABELS>).map((key) => (
                    <SelectItem key={key} value={key}>{CLASSIFICATION_LABELS[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Issue date" htmlFor="issueDate" error={errors.issueDate?.message}>
          <Input id="issueDate" type="date" {...register("issueDate")} disabled={locked} />
        </Field>
        <Field label="Due date" htmlFor="dueDate" error={errors.dueDate?.message}>
          <Input id="dueDate" type="date" {...register("dueDate")} disabled={locked} />
        </Field>
        <Field label="Payment status" htmlFor="paymentStatus">
          <Controller
            control={control}
            name="paymentStatus"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={locked}>
                <SelectTrigger id="paymentStatus"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PAYMENT_STATUS_LABELS) as Array<keyof typeof PAYMENT_STATUS_LABELS>).map((key) => (
                    <SelectItem key={key} value={key}>{PAYMENT_STATUS_LABELS[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Currency" htmlFor="currency" error={errors.currency?.message}>
          <Input id="currency" {...register("currency")} disabled={locked} placeholder="USD" maxLength={3} className="uppercase" />
        </Field>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Line items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={locked}
            onClick={() => lines.append({ description: "", quantity: "", unitPrice: "", amount: "" })}
          >
            <Plus aria-hidden="true" />
            Add line
          </Button>
        </div>
        {lines.fields.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No line items. Add them if you need them in QuickBooks.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Description</th>
                  <th className="w-20 px-1 pb-2 font-medium">Qty</th>
                  <th className="w-28 px-1 pb-2 font-medium">Unit price</th>
                  <th className="w-28 px-1 pb-2 font-medium">Amount</th>
                  <th className="w-10 pb-2" />
                </tr>
              </thead>
              <tbody>
                {lines.fields.map((line, index) => (
                  <tr key={line.id} className="align-top">
                    <td className="py-1 pr-2">
                      <Input
                        aria-label={`Line ${index + 1} description`}
                        {...register(`lineItems.${index}.description`)}
                        disabled={locked}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input aria-label={`Line ${index + 1} quantity`} inputMode="decimal" {...register(`lineItems.${index}.quantity`)} disabled={locked} />
                      {errors.lineItems?.[index]?.quantity && <p className="mt-1 text-xs text-destructive">{errors.lineItems[index]?.quantity?.message}</p>}
                    </td>
                    <td className="px-1 py-1">
                      <Input aria-label={`Line ${index + 1} unit price`} inputMode="decimal" {...register(`lineItems.${index}.unitPrice`)} disabled={locked} />
                      {errors.lineItems?.[index]?.unitPrice && <p className="mt-1 text-xs text-destructive">{errors.lineItems[index]?.unitPrice?.message}</p>}
                    </td>
                    <td className="px-1 py-1">
                      <Input aria-label={`Line ${index + 1} amount`} inputMode="decimal" {...register(`lineItems.${index}.amount`)} disabled={locked} />
                      {errors.lineItems?.[index]?.amount && <p className="mt-1 text-xs text-destructive">{errors.lineItems[index]?.amount?.message}</p>}
                    </td>
                    <td className="py-1 pl-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground"
                        aria-label={`Remove line ${index + 1}`}
                        disabled={locked}
                        onClick={() => lines.remove(index)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ml-auto grid max-w-md gap-3 rounded-lg bg-muted/60 p-4 sm:grid-cols-3">
        <Field label="Subtotal" htmlFor="subtotal" error={errors.subtotal?.message}>
          <Input id="subtotal" inputMode="decimal" {...register("subtotal")} disabled={locked} />
        </Field>
        <Field label="Tax" htmlFor="taxTotal" error={errors.taxTotal?.message}>
          <Input id="taxTotal" inputMode="decimal" {...register("taxTotal")} disabled={locked} />
        </Field>
        <Field label="Total" htmlFor="total" error={errors.total?.message}>
          <Input id="total" inputMode="decimal" {...register("total")} disabled={locked} className="font-semibold" />
        </Field>
      </div>

      {(dirty || saving) && (
        <div
          className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/95 px-4 py-3 shadow-lg backdrop-blur"
          role="region"
          aria-label="Unsaved changes"
        >
          <span className="text-sm text-muted-foreground">You have unsaved changes.</span>
          <span className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={saving} onClick={() => reset(invoiceScanFormDefaults(data))}>
              Discard
            </Button>
            <Button type="submit" size="sm" disabled={saving || disabled}>
              {saving && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              Save changes
            </Button>
          </span>
        </div>
      )}
    </form>
  );
}
