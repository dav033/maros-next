"use client";

import { motion, PresenceContext, useIsPresent, type HTMLMotionProps } from "motion/react";
import { forwardRef, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { SharedEntityName } from "@/components/shared/SharedEntityName";
import { TableRow } from "@/components/ui/table";
import { taskCardSurfaceTransition, routeEntranceTransition } from "@/shared/presentation/motionTransitions";

const MotionTableRow = motion.create(TableRow);

export const invoiceScanListMotion = {
  layout: "position",
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { ...routeEntranceTransition.transition, ...taskCardSurfaceTransition },
} satisfies HTMLMotionProps<"li">;

type AnimatedProps<T extends "tr" | "li"> = Omit<HTMLMotionProps<T>, "children"> & { children?: ReactNode };

const noop = () => {};
const registerNothing = () => noop;

export function InvoiceScanAnimatedTitle({ layoutId, children }: { layoutId: string; children: ReactNode }) {
  const isPresent = useIsPresent();
  const wasPresent = useRef(isPresent);
  const [generation, setGeneration] = useState(0);

  useLayoutEffect(() => {
    // A revived zero-size responsive title cannot clear Motion's old hidden projection through a layout delta.
    // Recreate only that projection; surviving titles keep their nodes and the list/detail layout ID is unchanged.
    if (isPresent && !wasPresent.current) setGeneration((current) => current + 1);
    wasPresent.current = isPresent;
  }, [isPresent]);

  return <SharedEntityName key={generation} layoutId={layoutId}>{children}</SharedEntityName>;
}

/**
 * A leaving record must not wait for the shared title inside it: when the same record enters the other section its
 * title shares a layoutId with this one, and Motion only finishes that exit after a layout animation that never
 * runs for a hidden (zero-size) responsive variant, which would leave an invisible inert row behind. Nested nodes
 * keep `isPresent` and `initial` (Motion's promote/relegate bookkeeping is unchanged) but stop registering with the
 * row's exit.
 */
function DetachedFromPresence({ children }: { children?: ReactNode }) {
  const row = useContext(PresenceContext);
  const detached = useMemo(() => row && { ...row, register: registerNothing, onExitComplete: noop }, [row]);
  return <PresenceContext.Provider value={detached}>{children}</PresenceContext.Provider>;
}

// Exiting records must stop participating in keyboard navigation and result announcements.
export const InvoiceScanAnimatedRow = forwardRef<HTMLTableRowElement, AnimatedProps<"tr">>(
  function InvoiceScanAnimatedRow({ children, ...props }, ref) {
    const isPresent = useIsPresent();
    return (
      <MotionTableRow {...props} ref={ref} aria-hidden={!isPresent || undefined} inert={!isPresent || undefined}>
        <DetachedFromPresence>{children}</DetachedFromPresence>
      </MotionTableRow>
    );
  },
);

export const InvoiceScanAnimatedCard = forwardRef<HTMLLIElement, AnimatedProps<"li">>(
  function InvoiceScanAnimatedCard({ children, ...props }, ref) {
    const isPresent = useIsPresent();
    return (
      <motion.li {...props} ref={ref} aria-hidden={!isPresent || undefined} inert={!isPresent || undefined}>
        <DetachedFromPresence>{children}</DetachedFromPresence>
      </motion.li>
    );
  },
);
