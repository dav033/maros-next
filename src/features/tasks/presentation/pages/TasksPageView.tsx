"use client";

import { useLayoutEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { PresenceTransitionLayer } from "@/components/shared/PresenceTransitionLayer";
import { pageSurfaceTransition } from "@/shared/presentation/motionTransitions";
import { TasksBoardPageView } from "./TasksBoardPageView";
import { TasksListPageView } from "./TasksListPageView";
import { MyTasksPageView } from "./MyTasksPageView";
import { useTasksViewState } from "../hooks/useTasksViewState";
import { TaskCalendarPageView } from "./TaskCalendarPageView";
import type { InitialTasksBoard } from "../data/loadInitialTasksBoard";

/** One route and one URL state machine for every task surface. */
export function TasksPageView({ initialBoard }: { initialBoard?: InitialTasksBoard }) {
  const { state } = useTasksViewState();
  const previousView = useRef(state.view);
  const shouldRestoreSwitcherFocus = useRef(false);
  const content =
    state.view === "list" ? (
      <TasksListPageView />
    ) : state.view === "mine" ? (
      <MyTasksPageView />
    ) : state.view === "calendar" ? (
      <TaskCalendarPageView />
    ) : (
      <TasksBoardPageView initialBoard={initialBoard} />
    );

  useLayoutEffect(() => {
    if (previousView.current === state.view) return;
    previousView.current = state.view;
    if (!shouldRestoreSwitcherFocus.current) return;
    shouldRestoreSwitcherFocus.current = false;

    const activeSwitcherButton = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "[data-task-view-switcher] button[aria-pressed='true']",
      ),
    ).find((button) => !button.closest("[inert]"));
    activeSwitcherButton?.focus({ preventScroll: true });
  }, [state.view]);

  return (
    <div
      className="grid min-w-0"
      onKeyDownCapture={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const target = event.target instanceof Element ? event.target : null;
        const button = target?.closest<HTMLButtonElement>(
          "[data-task-view-switcher] button[data-id]",
        );
        if (button?.dataset.id !== state.view) {
          shouldRestoreSwitcherFocus.current = Boolean(button);
        }
      }}
    >
      <AnimatePresence initial={false} mode="sync">
        <PresenceTransitionLayer
          key={state.view}
          className="col-start-1 row-start-1 min-w-0 w-full"
          {...pageSurfaceTransition}
        >
          {content}
        </PresenceTransitionLayer>
      </AnimatePresence>
    </div>
  );
}
