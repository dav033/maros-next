"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { cancelFrame, frame } from "motion/react";

const TEXT_STYLE_PROPERTIES = [
  "font-family", "font-size", "font-weight", "font-style", "line-height",
  "letter-spacing", "text-align", "text-transform", "white-space", "word-break",
  "overflow-wrap", "color", "padding-top", "padding-right", "padding-bottom", "padding-left",
] as const;

/** Motion owns the projection; a temporary body layer lets it cross scroll/clipping boundaries. */
export function useSharedElementOverlay(enabled: boolean) {
  const element = useRef<HTMLElement | null>(null);
  const overlay = useRef<HTMLSpanElement | null>(null);
  const updateFrame = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    if (updateFrame.current) cancelFrame(updateFrame.current);
    updateFrame.current = null;
    overlay.current?.remove();
    overlay.current = null;
    element.current?.removeAttribute("data-shared-element-overlay-active");
  }, []);

  const start = useCallback(() => {
    stop();
    const node = element.current;
    if (!enabled || !node || !node.offsetWidth || getComputedStyle(node).visibility === "hidden") return;

    const textInput = node.querySelector<HTMLTextAreaElement>("textarea") ?? node.querySelector<HTMLInputElement>("input");
    const textStyle = getComputedStyle(textInput ?? node);
    const copy = document.createElement("span");
    copy.textContent = textInput ? textInput.value || textInput.placeholder : node.textContent;
    copy.setAttribute("aria-hidden", "true");
    copy.setAttribute("data-shared-element-overlay-copy", "true");
    Object.assign(copy.style, {
      position: "fixed", left: "0", top: "0", margin: "0", display: "inline-block",
      boxSizing: "border-box", transformOrigin: "0 0", pointerEvents: "none", zIndex: "60",
    });
    for (const property of TEXT_STYLE_PROPERTIES) copy.style.setProperty(property, textStyle.getPropertyValue(property));

    const update = () => {
      if (!node.isConnected || !node.offsetWidth || !node.offsetHeight) { stop(); return; }
      const bounds = node.getBoundingClientRect();
      copy.style.width = `${node.offsetWidth}px`;
      copy.style.minHeight = `${node.offsetHeight}px`;
      copy.style.transform = `translate3d(${bounds.left}px, ${bounds.top}px, 0) scale(${bounds.width / node.offsetWidth}, ${bounds.height / node.offsetHeight})`;
      if (!copy.isConnected) {
        document.body.appendChild(copy);
        node.setAttribute("data-shared-element-overlay-active", "true");
      }
    };
    overlay.current = copy;
    updateFrame.current = update;
    frame.postRender(update, true);
  }, [enabled, stop]);

  useLayoutEffect(() => {
    if (!enabled) stop();
    return stop;
  }, [enabled, stop]);

  return {
    ref: useCallback((node: HTMLElement | null) => { element.current = node; }, []),
    onLayoutAnimationStart: start,
    onLayoutAnimationComplete: stop,
  };
}
