"use client";

import { useEffect, useState } from "react";

export interface UsePersistedStateOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
}

/** Como useState, pero persiste en localStorage bajo `key` (sobrevive navegación y reload).
 * `key` en `null`/`undefined` desactiva la persistencia (se comporta como useState puro) —
 * útil para dejar la key opcional en un hook compartido sin duplicar la implementación.
 * Arranca siempre con `defaultValue` (igual que el SSR) y recién lee localStorage después
 * del mount, para no pisar la hidratación de Next.js. */
export function usePersistedState<T>(
  key: string | null | undefined,
  defaultValue: T,
  options?: UsePersistedStateOptions<T>,
): [T, (value: T | ((prev: T) => T)) => void] {
  const serialize = options?.serialize ?? ((v: T) => JSON.stringify(v));
  const deserialize = options?.deserialize ?? ((raw: string) => JSON.parse(raw) as T);

  const [state, setState] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!key) {
      setIsHydrated(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setState(deserialize(raw));
    } catch {
      // Storage deshabilitada: seguimos con defaultValue.
    }
    setIsHydrated(true);
    // Solo al montar: cambiar de `key` no debe re-disparar la lectura inicial.
  }, []);

  useEffect(() => {
    if (!key || !isHydrated) return;
    try {
      window.localStorage.setItem(key, serialize(state));
    } catch {
      // Storage llena o deshabilitada: el estado sigue funcionando en memoria.
    }
  }, [key, state, serialize, isHydrated]);

  return [state, setState];
}

/** Serializers listos para usar con Set<string> (status filters, etc). */
export const setStorageCodec = {
  serialize: <T extends string>(value: Set<T>) => JSON.stringify([...value]),
  deserialize: <T extends string>(raw: string) => new Set(JSON.parse(raw) as T[]),
};
