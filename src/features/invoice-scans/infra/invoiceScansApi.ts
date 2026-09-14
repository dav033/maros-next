import { optimizedApiClient } from "@/shared/infra/http/OptimizedApiClient";
import type { InvoiceScan } from "../domain/models";

interface CreateInvoiceScanResponse {
  id: string;
  uploadUrl: string;
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

export async function retryInvoiceScan(id: string): Promise<InvoiceScan> {
  const { data } = await optimizedApiClient.post<InvoiceScan>(
    `/invoice-scans/${id}/scan`,
  );
  return data;
}
