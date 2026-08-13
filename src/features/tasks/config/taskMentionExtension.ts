import Mention from "@tiptap/extension-mention";
import type { SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import { optimizedApiClient } from "@/shared/infra";
import { queryClient } from "@/shared/lib/queryClient";
import { usersKeys } from "@/features/users/application";
import type { DirectoryUser } from "@/features/users/domain";
import {
  TaskMentionMenuList,
  type TaskMentionMenuListHandle,
} from "../presentation/organisms/TaskMentionMenuList";

/**
 * Shares its cache key with useUserDirectory (AssigneePicker's own directory query) —
 * opening the mention list after the assignee picker (or vice versa) is instant.
 * Not routed through the usual DI/usecase layer: a Suggestion's `items()` callback
 * runs outside React, with no context to pull a hook-provided app context from — same
 * reasoning `useNoteLinkableRecords` gives for calling `optimizedApiClient` directly.
 */
async function fetchDirectory(): Promise<DirectoryUser[]> {
  return queryClient.fetchQuery({
    queryKey: usersKeys.directory(),
    queryFn: async () => {
      const { data } = await optimizedApiClient.get<DirectoryUser[]>("/users/directory");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60_000,
  });
}

function matchesQuery(user: DirectoryUser, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (user.name ?? "").toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
}

const suggestion: Omit<SuggestionOptions<DirectoryUser>, "editor"> = {
  char: "@",
  items: async ({ query }) => {
    const directory = await fetchDirectory();
    return directory.filter((user) => matchesQuery(user, query)).slice(0, 8);
  },
  render: () => {
    let component: ReactRenderer<TaskMentionMenuListHandle> | null = null;
    let unmount: (() => void) | null = null;

    return {
      onStart: (props) => {
        component = new ReactRenderer(TaskMentionMenuList, {
          props: { items: props.items, command: props.command },
          editor: props.editor,
        });
        if (!props.clientRect) return;
        unmount = props.mount(component.element);
      },
      onUpdate: (props) => {
        component?.updateProps({ items: props.items, command: props.command });
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          unmount?.();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        unmount?.();
        component?.destroy();
      },
    };
  },
};

/**
 * Renders as a small pill (not the extension's plain "@Jane" text) so a mention reads
 * as a person, not a typo — see task-detail styles. Stores the user's id as the node's
 * `id` attribute; TaskCommentsService reads that back server-side to seed watchers and
 * fire task.mentioned (see PLAN-TAREAS-V2.md §4.2 — mentions are the one case where
 * someone gets pulled into a task thread they weren't already watching).
 */
export const TaskMention = Mention.configure({
  HTMLAttributes: {
    class:
      "rounded-full bg-primary/15 px-1.5 py-0.5 text-primary font-medium not-prose no-underline",
  },
  suggestion,
});
