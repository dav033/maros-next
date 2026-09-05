"use client";

import { useRouter } from "next/navigation";
import { TaskDetailSheet } from "../organisms/TaskDetailSheet";

export function TaskDetailPageView({ taskId }: { taskId: number }) {
  const router = useRouter();
  return (
    <main className="min-h-0 w-full min-w-0 bg-background">
      <TaskDetailSheet
        taskId={taskId}
        onClose={() => router.push("/tasks")}
        onOpenTask={(id) => router.replace(`/tasks/T-${id}`)}
        pageMode
      />
    </main>
  );
}
