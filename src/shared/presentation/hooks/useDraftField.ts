"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Local edit buffer for a field whose source can refetch mid-edit — e.g. a detail
 * sheet where saving one field (priority) invalidates the whole record and refetches
 * it, changing the object identity of every other field's source too.
 *
 * Resets to `sourceValue` whenever `recordId` changes (switched to a different
 * record), or on a same-record refetch as long as nothing has been typed since the
 * last `commit()`. Never resets while dirty, so a refetch triggered by editing a
 * *different* field on the same record can't clobber text this field hasn't saved
 * yet. Each field gets its own `useDraftField` call, so dirtiness never leaks
 * between fields on the same record.
 */
export function useDraftField<V>(recordId: number | string, sourceValue: V) {
  const [value, setValueState] = useState(sourceValue);
  const loadedId = useRef<typeof recordId | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    if (loadedId.current === recordId && dirty.current) return;
    loadedId.current = recordId;
    dirty.current = false;
    setValueState(sourceValue);
  }, [recordId, sourceValue]);

  const setValue = (next: V) => {
    dirty.current = true;
    setValueState(next);
  };

  /** Call once the current value has been persisted — clears the dirty guard. */
  const commit = () => {
    dirty.current = false;
  };

  return { value, setValue, commit };
}
