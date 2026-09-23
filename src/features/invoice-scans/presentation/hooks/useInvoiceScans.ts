"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { STALE_TIMES } from "@/shared/lib/queryClient";
import { notifyError, notifySuccess } from "@/shared/presentation/toast";

import type { InvoiceScan, InvoiceScanPatch } from "../../domain/models";
import {
  getInvoiceScan,
  listInvoiceScans,
  listProjectsForPicker,
  retryInvoiceScan,
  updateInvoiceScan,
} from "../../infra/invoiceScansApi";

export const invoiceScanKeys = {
  all: ["invoice-scans"] as const,
  list: () => ["invoice-scans", "list"] as const,
  detail: (id: string) => ["invoice-scans", "detail", id] as const,
  projects: () => ["invoice-scans", "projects"] as const,
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
