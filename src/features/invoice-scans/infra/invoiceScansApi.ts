import { optimizedApiClient } from "@/shared/infra/http/OptimizedApiClient";
import type {
  CreatedQboCounterparty,
  InvoiceDirection,
  InvoiceScan,
  InvoiceScanPatch,
  InvoiceTransactionDirection,
  QboCounterparty,
  QboCounterpartyType,
} from "../domain/models";

interface CreateInvoiceScanResponse {
  id: string;
  uploadUrl: string;
}

export interface ProjectPickerRecord {
  id: number;
  name: string;
  leadNumber: string | null;
}

export interface CreateManualInvoiceTransactionInput {
  description: string;
  direction: InvoiceTransactionDirection;
  transactionDate: string;
  amount: number;
  currency: string;
  counterpartyName?: string;
  counterpartyId?: string;
  counterpartyType?: QboCounterpartyType;
  projectNumber?: string | null;
}

export async function listInvoiceScans(): Promise<InvoiceScan[]> {
  const { data } =
    await optimizedApiClient.get<InvoiceScan[]>("/invoice-scans");
  return data;
}

export async function getInvoiceScan(id: string): Promise<InvoiceScan> {
  const { data } = await optimizedApiClient.get<InvoiceScan>(
    `/invoice-scans/${id}`,
  );
  return data;
}

export async function uploadAndScanInvoice(
  file: File,
  onStage?: (stage: string) => void,
): Promise<InvoiceScan> {
  const contentType =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : file.type;
  const { data: upload } =
    await optimizedApiClient.post<CreateInvoiceScanResponse>("/invoice-scans", {
      fileName: file.name,
      contentType,
      sizeBytes: file.size,
    });
  onStage?.("Uploading invoice file…");
  const response = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok)
    throw new Error("The invoice file could not be uploaded. Try again.");

  onStage?.("Reading invoice and matching QuickBooks records…");
  const { data: scan } = await optimizedApiClient.post<InvoiceScan>(
    `/invoice-scans/${upload.id}/scan`,
  );
  return scan;
}

export async function createManualInvoiceTransaction(
  input: CreateManualInvoiceTransactionInput,
): Promise<InvoiceScan> {
  const { data } = await optimizedApiClient.post<InvoiceScan>(
    "/invoice-scans/manual",
    input,
  );
  return data;
}

/**
 * Adjunta un documento a un registro que ya existe (la transacción manual se
 * guarda primero y el archivo es opcional). Sube el archivo a la URL firmada y
 * devuelve el registro ya con el documento.
 */
export async function attachInvoiceScanFile(
  id: string,
  file: File,
): Promise<InvoiceScan> {
  const contentType =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : file.type;
  const { data: prepared } = await optimizedApiClient.post<{
    id: string;
    key: string;
    uploadUrl: string;
  }>(
    `/invoice-scans/${id}/attachment`,
    { fileName: file.name, contentType, sizeBytes: file.size },
  );
  const response = await fetch(prepared.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok) throw new Error("The file could not be uploaded. Try again.");

  const { data: scan } = await optimizedApiClient.post<InvoiceScan>(
    `/invoice-scans/${id}/attachment/complete`,
    {
      key: prepared.key,
      fileName: file.name,
      contentType,
      sizeBytes: file.size,
    },
  );
  return scan;
}

/** URL firmada que descarga el documento original en vez de abrirlo. */
export async function getInvoiceScanDownloadUrl(
  id: string,
): Promise<{ url: string; fileName: string }> {
  const { data } = await optimizedApiClient.get<{ url: string; fileName: string }>(
    `/invoice-scans/${id}/download`,
  );
  return data;
}

export async function deleteInvoiceScan(id: string): Promise<void> {
  await optimizedApiClient.delete(`/invoice-scans/${id}`);
}

export async function updateInvoiceScan(
  id: string,
  patch: InvoiceScanPatch,
): Promise<InvoiceScan> {
  const { data } = await optimizedApiClient.patch<InvoiceScan>(
    `/invoice-scans/${id}`,
    patch,
  );
  return data;
}

export async function retryInvoiceScan(id: string): Promise<InvoiceScan> {
  const { data } = await optimizedApiClient.post<InvoiceScan>(
    `/invoice-scans/${id}/scan`,
  );
  return data;
}

/**
 * Vendors and customers of QuickBooks for the counterparty picker. A server
 * that answers `connected: false` (no connection, Intuit failing) still answers
 * 200 with no rows, so the caller gets an empty list instead of an error.
 */
export async function listQboCounterparties(): Promise<QboCounterparty[]> {
  const { data } = await optimizedApiClient.get<{
    connected: boolean;
    counterparties: QboCounterparty[];
  }>("/invoice-scans/counterparties");
  return Array.isArray(data?.counterparties) ? data.counterparties : [];
}

export interface CreateQboCounterpartyInput {
  name: string;
  /** Money out means a vendor, money in means a customer; the server decides. */
  direction: InvoiceDirection;
}

/**
 * Creates the counterparty in QuickBooks and the matching company in the CRM.
 * Unlike the rest of this file, a failure here matters: QuickBooks cannot undo
 * a create, so the caller has to see why it did not happen.
 */
export async function createQboCounterparty(
  input: CreateQboCounterpartyInput,
): Promise<CreatedQboCounterparty> {
  const { data } = await optimizedApiClient.post<CreatedQboCounterparty>(
    "/invoice-scans/counterparties",
    input,
  );
  return data;
}

/** Lightweight project list (no QuickBooks) for the project picker. */
export async function listProjectsForPicker(): Promise<ProjectPickerRecord[]> {
  const { data } =
    await optimizedApiClient.get<ProjectPickerRecord[]>("/projects/picker");
  return Array.isArray(data) ? data : [];
}
