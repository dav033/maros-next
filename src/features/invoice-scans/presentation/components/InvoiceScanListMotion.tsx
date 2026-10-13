"use client";

import { motion, useIsPresent, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";

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

// Exiting records must stop participating in keyboard navigation and result announcements.
export const InvoiceScanAnimatedRow = forwardRef<HTMLTableRowElement, HTMLMotionProps<"tr">>(
  function InvoiceScanAnimatedRow(props, ref) {
    const isPresent = useIsPresent();
    return <MotionTableRow {...props} ref={ref} aria-hidden={!isPresent || undefined} inert={!isPresent || undefined} />;
  },
);

export const InvoiceScanAnimatedCard = forwardRef<HTMLLIElement, HTMLMotionProps<"li">>(
  function InvoiceScanAnimatedCard(props, ref) {
    const isPresent = useIsPresent();
    return <motion.li {...props} ref={ref} aria-hidden={!isPresent || undefined} inert={!isPresent || undefined} />;
  },
);
