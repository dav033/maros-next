"use client";

import { useState, useLayoutEffect, useCallback, useRef, type RefObject } from "react";
export interface UseAnimatedHeightOptions {
  isOpen: boolean;
  dependencies?: unknown[];
}
export interface UseAnimatedHeightResult {
  contentRef: RefObject<HTMLDivElement | null>;
  inlineHeight: string | undefined;
  updateHeight: () => void;
}
export function useAnimatedHeight({
  isOpen,
  dependencies = [],
}: UseAnimatedHeightOptions): UseAnimatedHeightResult {
  const [inlineHeight, setInlineHeight] = useState<string | undefined>(
    isOpen ? "auto" : "0px"
  );
  const contentRef = useRef<HTMLDivElement | null>(null);
  const updateHeight = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    if (!isOpen) {
      setInlineHeight("0px");
      return;
    }
    const height = el.scrollHeight;
    setInlineHeight(`${height}px`);
  }, [isOpen]);
  useLayoutEffect(() => {
    updateHeight();
  }, [isOpen, updateHeight, ...dependencies]);
  return {
    contentRef,
    inlineHeight,
    updateHeight,
  };
}
