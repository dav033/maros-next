"use client";

import { ArrowDownLeft, ArrowUpRight, FileText, LoaderCircle, Paperclip, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, type ReactNode, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { InvoiceScan, InvoiceTransactionDirection } from "../../domain/models";
import {
  useAttachInvoiceScanFile,
  useCreateManualInvoiceTransaction,
} from "../hooks/useInvoiceScans";
import {
  CounterpartySelect,
  EMPTY_COUNTERPARTY,
  type CounterpartyValue,
} from "./CounterpartySelect";
import { ProjectNumberSelect } from "./ProjectNumberSelect";

const ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

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
 *
 * El documento es opcional: la transacción se guarda con lo que se escriba y, si
 * hay archivo, se adjunta después. Los valores escritos a mano son los que
 * valen; el archivo no se escanea ni los reemplaza.
 */
export function ManualTransactionForm({
  onCreated,
  cancelSlot,
  formLabel = "Add a manual transaction",
  idPrefix = "manual-transaction",
  className,
}: Props) {
  const create = useCreateManualInvoiceTransaction();
  const attach = useAttachInvoiceScanFile();
  const fileInput = useRef<HTMLInputElement>(null);
  const [direction, setDirection] = useState<InvoiceTransactionDirection | "">("");
  const [projectNumber, setProjectNumber] = useState<string | null>(null);
  const [counterparty, setCounterparty] = useState<CounterpartyValue>(EMPTY_COUNTERPARTY);
  const [file, setFile] = useState<File | null>(null);
  // El radio de dirección está visualmente oculto: con `required` el navegador
  // abortaba el envío en silencio por no poder enfocarlo ("no pasa nada"), así
  // que la falta se valida acá y se dice en pantalla.
  const [directionError, setDirectionError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const busy = create.isPending || attach.isPending;

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    const isPdf =
      chosen.type === "application/pdf" || chosen.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !ATTACHMENT_TYPES.has(chosen.type)) {
      setFileError("Attach a JPG, PNG or WebP photo, or a PDF file.");
      return;
    }
    if (chosen.size > MAX_ATTACHMENT_BYTES) {
      setFileError("The file must be smaller than 5 MB.");
      return;
    }
    setFileError(null);
    setFile(chosen);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!direction) {
      setDirectionError("Choose whether the money went out or came in.");
      return;
    }
    setDirectionError(null);

    const values = new FormData(event.currentTarget);
    const counterpartyName = counterparty.name.trim();
    const transaction = await create
      .mutateAsync({
        description: String(values.get("description") ?? "").trim(),
        direction,
        transactionDate: String(values.get("transactionDate") ?? ""),
        amount: Number(values.get("amount")),
        currency: String(values.get("currency") ?? "USD")
          .trim()
          .toUpperCase(),
        ...(counterpartyName && { counterpartyName }),
        // Solo viaja cuando se eligió de la lista; el nombre escrito a mano no
        // tiene id que mandar.
        ...(counterpartyName &&
          counterparty.id &&
          counterparty.type && {
            counterpartyId: counterparty.id,
            counterpartyType: counterparty.type,
          }),
        projectNumber,
      })
      .catch(() => null);
    if (!transaction) return;

    // El adjunto no puede tumbar lo ya guardado: si la subida falla se avisa
    // (el hook muestra el error) y la transacción queda creada igual.
    const withFile = file
      ? await attach.mutateAsync({ id: transaction.id, file }).catch(() => null)
      : null;

    onCreated(withFile ?? transaction);
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
              onChange={() => {
                setDirection("payment_made");
                setDirectionError(null);
              }}
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
              onChange={() => {
                setDirection("payment_received");
                setDirectionError(null);
              }}
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
        {directionError && (
          <p className="text-xs text-destructive" role="alert">
            {directionError}
          </p>
        )}
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
          {/* Un <p>, no un <Label>: cmdk pone su propio id en el input, así que
              un htmlFor apuntaría al vacío. El nombre accesible lo da `label`. */}
          <p className="text-sm font-medium">Paid to / received from</p>
          <CounterpartySelect
            label="Paid to / received from"
            value={counterparty}
            onChange={setCounterparty}
            disabled={busy}
            // Sin dirección elegida todavía no se sabe si una contraparte nueva
            // sería un vendor o un customer, así que no se ofrece crearla.
            direction={
              direction === "payment_received"
                ? "incoming"
                : direction === "payment_made"
                  ? "outgoing"
                  : undefined
            }
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
            disabled={busy}
          />
        </div>
      </section>

      <section className="space-y-2 border-t border-line pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Document (optional)</p>
          {!file && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
            >
              <Paperclip aria-hidden="true" />
              Attach invoice or receipt
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Not required. The amount you typed is what gets saved; the file is only kept
          alongside it.
        </p>
        {file && (
          <div className="flex items-center gap-2 rounded-lg border border-line bg-elev-3 px-3 py-2">
            <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-sm" title={file.name}>
              {file.name}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-7"
              aria-label={`Remove ${file.name}`}
              disabled={busy}
              onClick={() => setFile(null)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        )}
        {fileError && (
          <p className="text-xs text-destructive" role="alert">
            {fileError}
          </p>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
          className="sr-only"
          aria-label="Attach an invoice or receipt"
          onChange={chooseFile}
        />
      </section>

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-3">
        {cancelSlot}
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
          {attach.isPending ? "Attaching document…" : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
