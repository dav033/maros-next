"use client";

import { useState, useEffect, useCallback } from "react";
export interface UsePersistentToggleOptions {
  storageKey: string;
  initialValue: boolean;
}
export interface UsePersistentToggleResult {
  isOpen: boolean;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggle: () => void;
  isHydrated: boolean;
}
export function usePersistentToggle({
  storageKey,
  initialValue,
}: UsePersistentToggleOptions): UsePersistentToggleResult {
  const [isOpen, setIsOpen] = useState(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    if (initialValue) {
      setIsOpen(true);
    } else {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setIsOpen(saved === "true");
      }
    }
    setIsHydrated(true);
  }, [storageKey, initialValue]);
  useEffect(() => {
    if (isHydrated && initialValue) {
      setIsOpen(true);
    }
  }, [initialValue, isHydrated]);
  useEffect(() => {
    if (isHydrated && !initialValue) {
      localStorage.setItem(storageKey, String(isOpen));
    }
  }, [isOpen, storageKey, isHydrated, initialValue]);
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  return {
    isOpen,
    setIsOpen,
    toggle,
    isHydrated,
  };
}
