"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motion, useIsPresent, type MotionProps } from "motion/react";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";

const PresenceTransitionContext = createContext(true);

export function usePresenceTransitionLayerIsPresent(): boolean {
  return useContext(PresenceTransitionContext);
}

type PresenceTransitionLayerProps = {
  children: ReactNode;
  className: string;
  initial: MotionProps["initial"];
  animate: MotionProps["animate"];
  exit: MotionProps["exit"];
  transition: MotionProps["transition"];
};

/** Shared presence behavior for route and in-page view transitions. */
export function PresenceTransitionLayer({
  children,
  className,
  initial,
  animate,
  exit,
  transition,
}: PresenceTransitionLayerProps) {
  const isPresent = useContext(PresenceTransitionContext) && useIsPresent();
  const shouldReduceMotion = usePrefersReducedMotion();

  return (
    <PresenceTransitionContext.Provider value={isPresent}>
      <motion.div
        aria-hidden={!isPresent}
        inert={!isPresent}
        className={className}
        initial={shouldReduceMotion ? false : initial}
        animate={animate}
        exit={exit}
        transition={shouldReduceMotion ? { duration: 0 } : transition}
        style={{ pointerEvents: isPresent ? "auto" : "none" }}
      >
        {children}
      </motion.div>
    </PresenceTransitionContext.Provider>
  );
}
