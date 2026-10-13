"use client";

import { useSearchParams } from "next/navigation";

import { applyInvoiceScanFilters, parseInvoiceScanFilters } from "../../domain/filterParams";

/** Fixed destinations carry validated list criteria without accepting an arbitrary return URL. */
export function useInvoiceScanNavigation() {
  const currentQuery = useSearchParams()?.toString() ?? "";
  const query = applyInvoiceScanFilters(currentQuery, parseInvoiceScanFilters(currentQuery));
  const suffix = query ? `?${query}` : "";

  return {
    listHref: `/finance/invoices${suffix}`,
    detailHref: (id: string) => `/finance/invoices/${id}${suffix}`,
  };
}
