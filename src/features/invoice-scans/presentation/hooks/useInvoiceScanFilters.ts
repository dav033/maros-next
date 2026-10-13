"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { applyInvoiceScanFilters, parseInvoiceScanFilters } from "../../domain/filterParams";
import type { InvoiceScanFilters } from "../../domain/filters";

export function useInvoiceScanFilters() {
  const searchParams = useSearchParams();
  const query = searchParams?.toString() ?? "";
  const filters = useMemo(() => parseInvoiceScanFilters(query), [query]);
  const [resetKey, setResetKey] = useState(0);

  const replaceFilters = (next: InvoiceScanFilters) => {
    const url = new URL(window.location.href);
    url.search = applyInvoiceScanFilters(url.search, next);
    // Next's native history integration updates useSearchParams without fetching the route.
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const updateFilters = (patch: Partial<InvoiceScanFilters>) => {
    // Read the latest URL so consecutive input events cannot overwrite another criterion.
    const current = parseInvoiceScanFilters(window.location.search);
    replaceFilters({ ...current, ...patch });
  };

  const clearFilters = () => {
    setResetKey((current) => current + 1);
    replaceFilters({});
  };

  return { filters, updateFilters, clearFilters, resetKey };
}
