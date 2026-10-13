"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type SharedEntitySource = { entityId: string; instanceId: string; label?: string };
type SelectedSources = {
  sources: Readonly<Record<string, string>>;
  labels: Readonly<Record<string, string>>;
};
const SharedEntitySourceContext = createContext<{
  sources: Readonly<Record<string, string>>;
  labels: Readonly<Record<string, string>>;
  selectSource: (source: SharedEntitySource) => void;
} | null>(null);

/** A repeated entity (for example a client in several project rows) needs one selected origin. */
export function SharedEntitySourceProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedSources>({ sources: {}, labels: {} });
  const selectSource = useCallback(({ entityId, instanceId, label }: SharedEntitySource) => {
    setSelected((previous) => {
      const nextLabel = label?.trim() || previous.labels[entityId];
      if (previous.sources[entityId] === instanceId && previous.labels[entityId] === nextLabel) return previous;
      return {
        sources: { ...previous.sources, [entityId]: instanceId },
        labels: nextLabel === undefined ? previous.labels : { ...previous.labels, [entityId]: nextLabel },
      };
    });
  }, []);
  const value = useMemo(() => ({ ...selected, selectSource }), [selected, selectSource]);
  return <SharedEntitySourceContext.Provider value={value}>{children}</SharedEntitySourceContext.Provider>;
}

export function useSharedEntitySource() {
  return useContext(SharedEntitySourceContext);
}

/** Presentation-only text for a pending detail; it never makes a record complete. */
export function useSharedEntitySourceLabel(entityId: string) {
  return useSharedEntitySource()?.labels[entityId];
}
