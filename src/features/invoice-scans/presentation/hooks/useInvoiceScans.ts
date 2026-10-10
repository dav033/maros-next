"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { STALE_TIMES } from "@/shared/lib/queryClient";
import { notifyError, notifySuccess } from "@/shared/presentation/toast";

import type { InvoiceScan, InvoiceScanPatch } from "../../domain/models";
import {
  attachInvoiceScanFile,
  createManualInvoiceTransaction,
  createQboCounterparty,
  deleteInvoiceScan,
  getInvoiceScan,
  getInvoiceScanDownloadUrl,
  listInvoiceScans,
  listProjectsForPicker,
  listQboCounterparties,
  retryInvoiceScan,
  updateInvoiceScan,
} from "../../infra/invoiceScansApi";

export const invoiceScanKeys = {
  all: ["invoice-scans"] as const,
  list: () => ["invoice-scans", "list"] as const,
  detail: (id: string) => ["invoice-scans", "detail", id] as const,
  projects: () => ["invoice-scans", "projects"] as const,
  counterparties: () => ["invoice-scans", "counterparties"] as const,
};

export function useInvoiceScansList() {
  return useQuery({
    queryKey: invoiceScanKeys.list(),
    queryFn: listInvoiceScans,
    staleTime: STALE_TIMES.volatile,
  });
}

export function useInvoiceScanDetail(id: string) {
  return useQuery({
    queryKey: invoiceScanKeys.detail(id),
    queryFn: () => getInvoiceScan(id),
    staleTime: STALE_TIMES.volatile,
    refetchOnWindowFocus: true,
    // Detail responses include a 15-minute signed document URL. Refresh active
    // document views before it expires; manual transactions have no file to renew.
    refetchInterval: (query) =>
      query.state.data?.hasFile ? 10 * 60 * 1000 : false,
  });
}

export function useProjectPickerOptions(enabled = true) {
  return useQuery({
    queryKey: invoiceScanKeys.projects(),
    queryFn: listProjectsForPicker,
    enabled,
    staleTime: STALE_TIMES.lists,
    select: (records) =>
      records
        .filter((record) => !!record.leadNumber)
        .map((record) => ({
          value: record.leadNumber as string,
          label: `${record.leadNumber} · ${record.name}`,
        })),
  });
}

/**
 * QuickBooks vendors and customers for the counterparty picker. No toast on
 * failure: the field keeps working as free text, so an unreachable QuickBooks
 * is a missing shortcut, not an error the person has to act on.
 */
export function useQboCounterparties(enabled = true) {
  return useQuery({
    queryKey: invoiceScanKeys.counterparties(),
    queryFn: listQboCounterparties,
    enabled,
    staleTime: STALE_TIMES.lists,
  });
}

/**
 * Creates the counterparty in QuickBooks and in the CRM.
 *
 * Drops the cached list on the way out: the server caches it for ten minutes,
 * so without this the name just created would not come back in the next search.
 * The error is reported but not swallowed — the caller keeps the typed name.
 */
export function useCreateQboCounterparty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQboCounterparty,
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: invoiceScanKeys.counterparties() });
      notifySuccess(
        created.existedInQuickbooks
          ? `${created.name} was already in QuickBooks; it is now linked here.`
          : `${created.name} created as a ${created.type.toLowerCase()} in QuickBooks and as a company in the CRM.`,
      );
    },
    onError: (error) =>
      notifyError(error, "The counterparty could not be created."),
  });
}

export function useCreateManualInvoiceTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createManualInvoiceTransaction,
    onSuccess: (created) => {
      queryClient.setQueryData<InvoiceScan>(invoiceScanKeys.detail(created.id), created);
      void queryClient.invalidateQueries({ queryKey: invoiceScanKeys.list() });
      notifySuccess("Transaction added to the QuickBooks entry queue");
    },
    onError: (error) => notifyError(error, "The transaction could not be added."),
  });
}

/**
 * Saves a patch and refreshes both the detail and the list cache. The detail
 * keeps its presigned `imageUrl` (the PATCH response has none).
 */
export function useUpdateInvoiceScan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: InvoiceScanPatch) => updateInvoiceScan(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData<InvoiceScan>(invoiceScanKeys.detail(id), (current) =>
        current ? { ...updated, imageUrl: current.imageUrl } : updated,
      );
      void queryClient.invalidateQueries({ queryKey: invoiceScanKeys.list() });
    },
  });
}

/** Tick / untick "entered in QuickBooks" from the list or the detail page. */
export function useSetInvoiceScanEntered() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, entered }: { id: string; entered: boolean }) =>
      updateInvoiceScan(id, { entered }),
    onSuccess: (updated, { entered }) => {
      queryClient.setQueryData<InvoiceScan>(invoiceScanKeys.detail(updated.id), (current) =>
        current ? { ...updated, imageUrl: current.imageUrl } : current,
      );
      queryClient.setQueryData<InvoiceScan[]>(invoiceScanKeys.list(), (current) =>
        current?.map((scan) => (scan.id === updated.id ? { ...scan, ...updated } : scan)),
      );
      notifySuccess(entered ? "Marked as entered in QuickBooks" : "Moved back to pending");
    },
    onError: (error) => notifyError(error, "The invoice could not be updated."),
  });
}

/**
 * Edits one field straight from a table row. The row updates in place from the
 * server's answer; a failed save is reported and the row snaps back.
 */
export function useUpdateInvoiceScanInline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: InvoiceScanPatch }) =>
      updateInvoiceScan(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData<InvoiceScan>(invoiceScanKeys.detail(updated.id), (current) =>
        current ? { ...updated, imageUrl: current.imageUrl } : current,
      );
      queryClient.setQueryData<InvoiceScan[]>(invoiceScanKeys.list(), (current) =>
        current?.map((scan) => (scan.id === updated.id ? { ...scan, ...updated } : scan)),
      );
    },
    onError: (error) => notifyError(error, "The invoice could not be updated."),
  });
}

/** Adjunta un documento a un registro ya guardado; el archivo es opcional. */
export function useAttachInvoiceScanFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => attachInvoiceScanFile(id, file),
    onSuccess: (updated) => {
      queryClient.setQueryData<InvoiceScan>(invoiceScanKeys.detail(updated.id), (current) =>
        current ? { ...current, ...updated } : updated,
      );
      // La respuesta del adjunto no trae `imageUrl` (la URL firmada la da el
      // detalle), así que hay que volver a pedirlo para poder ver el documento.
      void queryClient.invalidateQueries({ queryKey: invoiceScanKeys.detail(updated.id) });
      void queryClient.invalidateQueries({ queryKey: invoiceScanKeys.list() });
      notifySuccess("Document attached");
    },
    onError: (error) => notifyError(error, "The document could not be attached."),
  });
}

/**
 * Borra el registro. Quita la fila de la lista en el momento; la lista se vuelve
 * a pedir igual para no quedar desfasada con lo que haya hecho otro usuario.
 */
export function useDeleteInvoiceScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvoiceScan(id),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<InvoiceScan[]>(invoiceScanKeys.list(), (current) =>
        current?.filter((scan) => scan.id !== id),
      );
      queryClient.removeQueries({ queryKey: invoiceScanKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: invoiceScanKeys.list() });
      notifySuccess("Transaction deleted");
    },
    onError: (error) => notifyError(error, "The transaction could not be deleted."),
  });
}

/**
 * Pide la URL firmada de descarga y la abre. La URL fuerza `attachment`, así que
 * el navegador guarda el archivo en vez de abrir el PDF en una pestaña.
 */
export function useDownloadInvoiceScanFile() {
  const pendingTabs = useRef(new Map<number, Window>());
  const nextRequestId = useRef(0);
  const mutation = useMutation({
    mutationFn: ({ id }: { id: string; requestId: number }) =>
      getInvoiceScanDownloadUrl(id),
    onSuccess: ({ url }, { requestId }) => {
      const tab = pendingTabs.current.get(requestId);
      pendingTabs.current.delete(requestId);
      if (!tab || tab.closed) return;
      tab.location.replace(url);
    },
    onError: (error, { requestId }) => {
      pendingTabs.current.get(requestId)?.close();
      pendingTabs.current.delete(requestId);
      notifyError(error, "The document could not be downloaded.");
    },
  });

  return {
    ...mutation,
    variables: mutation.variables?.id,
    mutate: (id: string) => {
      const tab = window.open("about:blank", "_blank");
      if (!tab) {
        notifyError(
          undefined,
          "Allow pop-ups for this site to download the document.",
        );
        return;
      }

      tab.opener = null;
      tab.document.title = "Preparing document download";
      tab.document.body.textContent = "Preparing your document download…";
      const requestId = ++nextRequestId.current;
      pendingTabs.current.set(requestId, tab);
      mutation.mutate({ id, requestId });
    },
  };
}

export function useRetryInvoiceScan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => retryInvoiceScan(id),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: invoiceScanKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: invoiceScanKeys.list() });
    },
  });
}
