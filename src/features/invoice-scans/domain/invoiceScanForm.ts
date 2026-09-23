import { z } from "zod";

import type { ExtractedInvoiceData, InvoiceScanPatch } from "./models";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Empty string means "not on the document"; it is sent as null. */
const optionalText = z.string().trim().max(255);
const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || ISO_DATE.test(value), "Use the YYYY-MM-DD format");
const optionalAmount = z
  .string()
  .trim()
  .refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), "Enter a positive amount");

const lineItemSchema = z.object({
  description: z.string().trim().max(500),
  quantity: optionalAmount,
  unitPrice: optionalAmount,
  amount: optionalAmount,
});

export const invoiceScanFormSchema = z.object({
  direction: z.enum(["outgoing", "incoming", "unknown"]),
  classification: z.enum([
    "customer_service",
    "materials_expense",
    "subcontractor_expense",
    "other",
    "unknown",
  ]),
  counterpartyName: optionalText,
  invoiceNumber: z.string().trim().max(100),
  issueDate: optionalDate,
  dueDate: optionalDate,
  currency: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[A-Za-z]{3}$/.test(value), "Use a 3-letter code (USD)"),
  paymentStatus: z.enum(["paid", "unpaid", "unknown"]),
  subtotal: optionalAmount,
  taxTotal: optionalAmount,
  total: optionalAmount,
  lineItems: z.array(lineItemSchema).max(200),
});

export type InvoiceScanFormValues = z.infer<typeof invoiceScanFormSchema>;

function amountToInput(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function invoiceScanFormDefaults(
  data: ExtractedInvoiceData | null,
): InvoiceScanFormValues {
  return {
    direction: data?.direction ?? "unknown",
    classification: data?.classification ?? "unknown",
    counterpartyName: data?.counterpartyName ?? "",
    invoiceNumber: data?.invoiceNumber ?? "",
    issueDate: data?.issueDate ?? "",
    dueDate: data?.dueDate ?? "",
    currency: data?.currency ?? "",
    paymentStatus: data?.paymentStatus ?? "unknown",
    subtotal: amountToInput(data?.subtotal),
    taxTotal: amountToInput(data?.taxTotal),
    total: amountToInput(data?.total),
    lineItems: (data?.lineItems ?? []).map((line) => ({
      description: line.description,
      quantity: amountToInput(line.quantity),
      unitPrice: amountToInput(line.unitPrice),
      amount: amountToInput(line.amount),
    })),
  };
}

function inputToAmount(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

/** Everything the form holds, in API shape. Line items without any content are dropped. */
export function invoiceScanFormToPatch(values: InvoiceScanFormValues): InvoiceScanPatch {
  return {
    direction: values.direction,
    classification: values.classification,
    counterpartyName: values.counterpartyName || null,
    invoiceNumber: values.invoiceNumber || null,
    issueDate: values.issueDate || null,
    dueDate: values.dueDate || null,
    currency: values.currency ? values.currency.toUpperCase() : null,
    paymentStatus: values.paymentStatus,
    subtotal: inputToAmount(values.subtotal),
    taxTotal: inputToAmount(values.taxTotal),
    total: inputToAmount(values.total),
    lineItems: values.lineItems
      .filter(
        (line) =>
          line.description.trim() !== "" ||
          line.quantity.trim() !== "" ||
          line.unitPrice.trim() !== "" ||
          line.amount.trim() !== "",
      )
      .map((line) => ({
        description: line.description.trim(),
        quantity: inputToAmount(line.quantity),
        unitPrice: inputToAmount(line.unitPrice),
        amount: inputToAmount(line.amount),
      })),
  };
}
