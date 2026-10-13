"use client";

import { useCallback, useLayoutEffect, useRef, type ReactNode } from "react";
import { useSharedEntitySource } from "@/shared/presentation/SharedEntitySourceContext";
import { motion, type Transition } from "motion/react";
import { useSharedElementOverlay } from "@/shared/presentation/hooks/useSharedElementOverlay";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { sharedEntityNameTransition, sharedEntityReturnTransition } from "@/shared/presentation/motionTransitions";

export function SharedEntityName({
  layoutId,
  layoutCrossfade = false,
  transitionRole = "source",
  as = "span",
  transition,
  clipOverlay = true,
  sourceInstance,
  children,
  className,
}: {
  layoutId: string | undefined;
  layoutCrossfade?: boolean;
  transitionRole?: "source" | "detail";
  as?: "span" | "div" | "p";
  transition?: Transition;
  clipOverlay?: boolean;
  sourceInstance?: string;
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = usePrefersReducedMotion();
  const sourceContext = useSharedEntitySource();
  const nodeRef = useRef<HTMLElement | null>(null);
  const instanceLayoutId = layoutId && sourceInstance ? `${layoutId}-source-${sourceInstance}` : layoutId;
  const selectedSource = layoutId ? sourceContext?.sources[layoutId] : undefined;
  const effectiveLayoutId = transitionRole === "detail" && selectedSource ? selectedSource : instanceLayoutId;
  const Element = as === "div" ? motion.div : as === "p" ? motion.p : motion.span;
  const overlay = useSharedElementOverlay(clipOverlay && !shouldReduceMotion && Boolean(layoutId));
  const selectSource = sourceContext?.selectSource;
  useLayoutEffect(() => {
    if (transitionRole !== "source" || !layoutId || !instanceLayoutId || !selectSource) return;
    const trigger = nodeRef.current?.closest("a, button, [role='link'], tr");
    if (!trigger) return;
    const select = () => selectSource({
      entityId: layoutId,
      instanceId: instanceLayoutId,
      label: nodeRef.current?.textContent ?? undefined,
    });
    const selectOnKeyDown = (event: Event) => {
      if (!(event instanceof KeyboardEvent) || (event.key !== "Enter" && event.key !== " ")) return;
      // Child controls own their activation; only the focused navigation trigger selects this source.
      if (event.target !== trigger) return;
      select();
    };
    trigger.addEventListener("click", select, true);
    trigger.addEventListener("keydown", selectOnKeyDown, true);
    return () => {
      trigger.removeEventListener("click", select, true);
      trigger.removeEventListener("keydown", selectOnKeyDown, true);
    };
  }, [transitionRole, layoutId, instanceLayoutId, selectSource]);
  const ref = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
    overlay.ref(node);
  }, [overlay.ref]);

  return (
    <Element
      {...overlay}
      ref={ref}
      layoutId={shouldReduceMotion ? undefined : effectiveLayoutId}
      layoutCrossfade={layoutCrossfade}
      transition={transition ?? (transitionRole === "detail" ? sharedEntityNameTransition : sharedEntityReturnTransition)}
      className={`inline-block ${className ?? ""}`}
    >
      {children}
    </Element>
  );
}
