"use client";

/**
 * Adapted from Motion Primitives Animated Background.
 * Copyright (c) 2024 ibelick. Licensed under the MIT License.
 * Source: https://github.com/ibelick/motion-primitives/blob/main/components/core/animated-background.tsx
 */

import { AnimatePresence, motion, type Transition } from "motion/react";
import {
  Children,
  cloneElement,
  useId,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";

type AnimatedItemProps<T extends string> = {
  "data-id": T;
  "data-checked"?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
};

type AnimatedBackgroundProps<T extends string> = {
  children: ReactElement<AnimatedItemProps<T>>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  transition?: Transition;
};

export function AnimatedBackground<T extends string>({
  children,
  value,
  onValueChange,
  className,
  transition = { type: "spring", stiffness: 350, damping: 30 },
}: AnimatedBackgroundProps<T>) {
  const reduceMotion = usePrefersReducedMotion();
  const layoutId = useId();

  return Children.map(children, (child) => {
    const id = child.props["data-id"];
    const active = id === value;

    return cloneElement(
      child,
      {
        className: cn("relative isolate", child.props.className),
        "data-checked": value === id ? "true" : "false",
        onClick: (event) => {
          child.props.onClick?.(event);
          if (!event.defaultPrevented) onValueChange(id);
        },
      },
      <>
        {active ? (
          <AnimatePresence initial={false}>
            <motion.span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 rounded-md bg-card shadow-sm",
                className,
              )}
              layoutId={`maros-animated-background-${layoutId}`}
              transition={reduceMotion ? { duration: 0 } : transition}
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </AnimatePresence>
        ) : null}
        <span className="relative z-10 inline-flex items-center gap-1.5">
          {child.props.children}
        </span>
      </>,
    );
  });
}
