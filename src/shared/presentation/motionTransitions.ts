import type { MotionProps, Transition } from "motion/react";

export const TASK_CARD_SURFACE_DURATION_MS = 320;

export const taskCardSurfaceTransition: Transition = {
  layout: { type: "tween", duration: TASK_CARD_SURFACE_DURATION_MS / 1000, ease: [0.22, 1, 0.36, 1] },
};

export const pageSurfaceTransition = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0 },
  transition: {
    opacity: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
    y: { type: "spring", stiffness: 105, damping: 24, mass: 1 },
    scale: { type: "spring", stiffness: 105, damping: 24, mass: 1 },
  },
} satisfies {
  initial: MotionProps["initial"];
  animate: MotionProps["animate"];
  exit: MotionProps["exit"];
  transition: MotionProps["transition"];
};

export const routeEntranceTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      opacity: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
      y: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
    },
  },
  transition: {
    opacity: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    y: { type: "spring", stiffness: 120, damping: 22, mass: 1 },
  },
} satisfies {
  initial: MotionProps["initial"];
  animate: MotionProps["animate"];
  exit: MotionProps["exit"];
  transition: MotionProps["transition"];
};

export const projectRouteEntranceTransition = {
  initial: false,
  animate: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { opacity: { duration: 0.24, ease: [0.4, 0, 0.2, 1] } },
  },
  transition: { opacity: { duration: 0.16, ease: [0.22, 1, 0.36, 1] } },
} satisfies {
  initial: MotionProps["initial"];
  animate: MotionProps["animate"];
  exit: MotionProps["exit"];
  transition: MotionProps["transition"];
};

export const sharedEntityNameTransition: Transition = {
  layout: {
    type: "tween",
    duration: 0.42,
    ease: [0.4, 0, 0.2, 1],
  },
};

export const sharedEntityReturnTransition: Transition = {
  layout: {
    type: "tween",
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1],
  },
};
