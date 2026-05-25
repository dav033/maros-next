"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type DateFilter,
  type QuickRangeKey,
  detectQuickRangeKey,
  detectQuickRangeLabel,
  getDefaultDateFilter,
  getQuickDateRange,
  isSameRange,
  isValidDateRange,
  readQuickRangeFromSearchParams,
  readRangeFromSearchParams,
} from "./dateRange";

type DateRangeState = {
  draftRange: DateFilter;
  range: DateFilter;
  hasValidRange: boolean;
  hasRangeChanged: boolean;
  hasInvertedDates: boolean;
  appliedQuickRangeLabel: string | null;
  setDraftRange: Dispatch<SetStateAction<DateFilter>>;
  applyRange: () => void;
  resetRange: () => void;
  applyQuickRange: (key: QuickRangeKey) => void;
};

export function useDashboardDateRange(): DateRangeState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draftRange, setDraftRange] = useState<DateFilter>(() => getDefaultDateFilter());
  const [range, setRange] = useState<DateFilter>(() => getDefaultDateFilter());

  const hasValidRange = isValidDateRange(draftRange);
  const hasRangeChanged = draftRange.from !== range.from || draftRange.to !== range.to;
  const hasBothDates = Boolean(draftRange.from) && Boolean(draftRange.to);
  const hasInvertedDates = hasBothDates && draftRange.from > draftRange.to;
  const appliedQuickRangeLabel = detectQuickRangeLabel(range);

  const updateRangeInUrl = (nextRange: DateFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", nextRange.from);
    params.set("to", nextRange.to);
    const preset = detectQuickRangeKey(nextRange);
    if (preset) {
      params.set("preset", preset);
    } else {
      params.delete("preset");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const urlRange = readRangeFromSearchParams(searchParams);
    if (urlRange) {
      setDraftRange((prev) => (isSameRange(prev, urlRange) ? prev : urlRange));
      setRange((prev) => (isSameRange(prev, urlRange) ? prev : urlRange));
      return;
    }

    const quickPreset = readQuickRangeFromSearchParams(searchParams);
    if (quickPreset) {
      const next = getQuickDateRange(quickPreset);
      setDraftRange((prev) => (isSameRange(prev, next) ? prev : next));
      setRange((prev) => (isSameRange(prev, next) ? prev : next));
      updateRangeInUrl(next);
      return;
    }

    const next = getDefaultDateFilter();
    setDraftRange((prev) => (isSameRange(prev, next) ? prev : next));
    setRange((prev) => (isSameRange(prev, next) ? prev : next));
    updateRangeInUrl(next);
  }, [pathname, router, searchParams]);

  const applyRange = () => {
    if (!hasValidRange) return;
    setRange(draftRange);
    updateRangeInUrl(draftRange);
  };

  const resetRange = () => {
    const next = getDefaultDateFilter();
    setDraftRange(next);
    setRange(next);
    updateRangeInUrl(next);
  };

  const applyQuickRange = (key: QuickRangeKey) => {
    const next = getQuickDateRange(key);
    setDraftRange(next);
    setRange(next);
    updateRangeInUrl(next);
  };

  return {
    draftRange,
    range,
    hasValidRange,
    hasRangeChanged,
    hasInvertedDates,
    appliedQuickRangeLabel,
    setDraftRange,
    applyRange,
    resetRange,
    applyQuickRange,
  };
}
