"use client";

import { motion, type Variants } from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { X } from "lucide-react";
import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { taskCardSurfaceTransition } from "@/shared/presentation/motionTransitions";

function taskDetailPanelVariants(hasSharedSurface: boolean): Variants {
  return {
    hidden: { opacity: 0, y: 8 },
    shared: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        opacity: {
          duration: 0.16,
          delay: hasSharedSurface ? 0.04 : 0,
          ease: [0.22, 1, 0.36, 1],
        },
        y: { type: "spring", stiffness: 200, damping: 26, mass: 0.85 },
        delayChildren: 0,
        staggerChildren: 0,
      },
    },
    reduced: { opacity: 1, y: 0 },
  };
}

export function TaskDetailDialogSurface({
  pageMode,
  children,
  sharedLayoutId,
  hasSharedExitTarget,
  shouldReduceMotion,
  onCloseAutoFocus,
}: {
  pageMode: boolean;
  children: ReactNode;
  sharedLayoutId?: string;
  hasSharedExitTarget: boolean;
  shouldReduceMotion: boolean;
  onCloseAutoFocus?: ComponentPropsWithoutRef<typeof DialogContent>["onCloseAutoFocus"];
}) {
  const hasSharedSurface = Boolean(sharedLayoutId);
  const panelVariants = taskDetailPanelVariants(hasSharedSurface);
  const content = (
    <motion.div
      variants={panelVariants}
      initial={shouldReduceMotion ? false : hasSharedSurface ? "shared" : "hidden"}
      animate={shouldReduceMotion ? "reduced" : "visible"}
      className="@container/task-detail min-w-0 p-4 sm:p-6"
    >
      {children}
    </motion.div>
  );

  if (pageMode) {
    return (
      <div className="relative min-w-0 w-full bg-background">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        {content}
      </div>
    );
  }

  return (
    <DialogContent
      data-task-detail-dialog="true"
      onCloseAutoFocus={onCloseAutoFocus}
      className={cn(
        "h-[100dvh] max-h-[100dvh] w-screen max-w-none overflow-y-auto overscroll-contain bg-background p-0 sm:h-[90dvh] sm:max-h-[90dvh] sm:w-[min(1100px,calc(100vw-2rem))] sm:rounded-xl",
        "data-[state=open]:!animate-none",
        hasSharedExitTarget && "data-[state=closed]:!animate-none",
        sharedLayoutId && "!border-0 !bg-transparent !shadow-none",
      )}
    >
      {sharedLayoutId ? (
        <motion.div
          layoutId={sharedLayoutId}
          layoutCrossfade={false}
          transition={taskCardSurfaceTransition}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-none border border-line bg-background shadow-2xl sm:rounded-xl"
        />
      ) : null}
      <div className={sharedLayoutId ? "relative z-10" : undefined}>{content}</div>
    </DialogContent>
  );
}
