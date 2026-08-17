"use client";

import { TasksBoardPageView } from "./TasksBoardPageView";
import { TasksListPageView } from "./TasksListPageView";
import { MyTasksPageView } from "./MyTasksPageView";
import { useTasksViewState } from "../hooks/useTasksViewState";
import { TaskCalendarPageView } from "./TaskCalendarPageView";

/** One route and one URL state machine for every task surface. */
export function TasksPageView() {
  const { state } = useTasksViewState();
  if (state.view === "list") return <TasksListPageView />;
  if (state.view === "mine") return <MyTasksPageView />;
  if (state.view === "calendar") return <TaskCalendarPageView />;
  return <TasksBoardPageView />;
}
